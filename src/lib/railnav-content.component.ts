import { Component, DOCUMENT, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, booleanAttribute, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatSidenavContent } from '@angular/material/sidenav';
import { RailnavAnchors } from './railnav-anchors';
import { RailnavContainerComponent } from './railnav-container.component';

@Component({
  selector: 'rail-nav-content',
  template: `<ng-content />`,
  styles: [`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
      margin-left: var(--rail-nav-collapsed-width, 72px);
    }

    /* Establish a stacking context on the content so that any high z-index
       inside it stays trapped BELOW the backdrop (z-index 99) and the rail
       (z-index 100). Without this, a CDK sticky table header — which gets an
       inline z-index:100 (StickyStyler top increment), up to ~112 when sticky
       on several edges — leaks into the root stacking context and renders ABOVE
       the backdrop, even though the rest of the table sits correctly underneath.

       Material's own \`.mat-drawer-content { position:relative; z-index:1 }\` would
       normally provide this context, but that rule (ViewEncapsulation.None) is
       only injected when a real MatSidenavContent is instantiated; this component
       subclasses it with its own decorator, so the rule never loads. We set it
       explicitly. \`:host(.mat-drawer-content)\` (specificity 0,2,0) deterministically
       beats Material's \`.mat-drawer-content\` (0,1,0) if it ever IS loaded (nested
       real MatDrawer), regardless of stylesheet order. */
    :host(.mat-drawer-content) {
      position: relative;
      z-index: 1;
    }

    :host(.position-end) {
      margin-left: 0;
      margin-right: var(--rail-nav-collapsed-width, 72px);
    }

    /* The browser's own scroll to a URL fragment — a shared link loading, an in-page link — leaves
       the scroll offset above the section too. On the :target only: a scroll-padding on the content
       would also scroll it back whenever the focus enters a sticky header. Without an offset, the
       page's own scroll-margin stays. */
    :host(.scroll-offset) ::ng-deep :target {
      scroll-margin-top: var(--rail-nav-scroll-offset);
    }
  `],
  host: {
    'class': 'mat-drawer-content mat-sidenav-content',
    '[class.position-end]': 'effectivePosition() === "end"',
    '[class.scroll-offset]': 'scrollOffset() > 0',
    '[style.--rail-nav-scroll-offset.px]': 'scrollOffset() || null'
  }
})
export class RailnavContentComponent extends MatSidenavContent {
  /** Optional: Position of the rail. If not set, uses the sibling rail-nav's position */
  readonly position = input<'start' | 'end' | undefined>(undefined);

  /**
   * Distance (px) from the top of the content at which a section counts as reached, and the room
   * left above a section scrolled to — by the rail, or by the browser for a URL fragment. Set it to
   * the height of a sticky header, if any.
   */
  readonly scrollOffset = input(0, { transform: numberAttribute });

  /**
   * Mirrors the section in view in the URL fragment (`#id`), dropped above the first section —
   * replacing the history entry, never adding one — and scrolls to the fragment's section when the
   * page loads. Not for an app routed with `withHashLocation()`: its route lives in the fragment,
   * which this would overwrite.
   */
  readonly anchorFragment = input(false, { transform: booleanAttribute });

  /** Parent container that gives access to sibling rail-nav */
  private container = inject(RailnavContainerComponent, { optional: true });

  private readonly anchors = inject(RailnavAnchors, { optional: true });
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);

  /** Id of the section in view among the rail items' anchors; null above the first one. */
  readonly activeAnchor = computed(() => this.anchors?.active() ?? null);

  /** Effective position - from input or from sibling rail-nav */
  protected readonly effectivePosition = computed(() => {
    const inputValue = this.position();
    if (inputValue !== undefined) return inputValue;
    return this.container?.railnav?.railPosition() ?? 'start';
  });

  private spyFrame = 0;
  private scrollFrame = 0;
  /** A scroll to an anchor is running: the section in view is the one asked for, not the one passing by. */
  private scrollingToAnchor = false;
  /** Until the page's opening fragment is read, dropping it would lose a shared link. */
  private fragmentRead = false;

  constructor() {
    super();
    const anchors = this.anchors;
    // Effects run on the server too, where there is no layout to watch nor frames to wait for.
    if (!anchors || !isPlatformBrowser(inject(PLATFORM_ID))) return;
    anchors.scrollTo = (id) => this.scrollToAnchor(id);

    const onScroll = (): void => this.scheduleSpy();
    // The user takes over: a scroll to an anchor still running stops.
    const onUserScroll = (): void => this.stopScrollToAnchor();
    this.host.addEventListener('scroll', onScroll, { passive: true });
    this.host.addEventListener('wheel', onUserScroll, { passive: true });
    this.host.addEventListener('touchstart', onUserScroll, { passive: true });
    inject(DestroyRef).onDestroy(() => {
      this.host.removeEventListener('scroll', onScroll);
      this.host.removeEventListener('wheel', onUserScroll);
      this.host.removeEventListener('touchstart', onUserScroll);
      cancelAnimationFrame(this.spyFrame);
      this.stopScrollToAnchor();
    });

    // New anchors, or another offset, change which section counts as in view.
    effect(() => {
      anchors.ids();
      this.scrollOffset();
      this.scheduleSpy();
    });
    effect(() => {
      const id = anchors.active();
      if (!this.anchorFragment()) return;
      if (id) this.writeFragment(id);
      // No section reached: drop the fragment, if it is one of ours.
      else if (this.fragmentRead && anchors.ids().has(this.fragmentId())) this.writeFragment(null);
    });
    afterNextRender(() => {
      this.fragmentRead = true;
      if (!this.anchorFragment()) return;
      const id = this.fragmentId();
      if (id && anchors.ids().has(id)) this.scrollToAnchor(id, 'instant');
    });
  }

  /**
   * Scrolls until the section `#id` sits `scrollOffset` px below the top of the content — smoothly,
   * unless `behavior` is `instant` or the user prefers reduced motion. Its item turns active at once.
   */
  scrollToAnchor(id: string, behavior: 'smooth' | 'instant' = 'smooth'): void {
    const section = this.sectionOf(id);
    if (!section) return;
    const wanted = section.getBoundingClientRect().top - this.host.getBoundingClientRect().top + this.host.scrollTop - this.scrollOffset();
    const target = Math.max(0, Math.min(wanted, this.host.scrollHeight - this.host.clientHeight));
    this.stopScrollToAnchor();
    this.anchors?.active.set(id);
    // Until the frame after the last move: the scroll events it fires must not re-elect a section.
    this.scrollingToAnchor = true;

    const reducedMotion = this.doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const start = this.host.scrollTop;
    const distance = target - start;
    if (behavior === 'instant' || reducedMotion || Math.abs(distance) < 2) {
      this.host.scrollTop = target;
      this.scrollFrame = requestAnimationFrame(() => (this.scrollingToAnchor = false));
      return;
    }

    // MatSidenavContent ignores `scrollTo({ behavior: 'smooth' })`: the easing is done here.
    const duration = Math.min(600, Math.max(220, Math.abs(distance) * 0.35));
    const startedAt = performance.now();
    const step = (now: number): void => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      this.host.scrollTop = start + distance * eased;
      this.scrollFrame = requestAnimationFrame(progress < 1 ? step : () => (this.scrollingToAnchor = false));
    };
    this.scrollFrame = requestAnimationFrame(step);
  }

  private stopScrollToAnchor(): void {
    cancelAnimationFrame(this.scrollFrame);
    this.scrollingToAnchor = false;
  }

  /** At most one evaluation per frame, and none while scrolling to an anchor. */
  private scheduleSpy(): void {
    if (this.scrollingToAnchor || this.spyFrame) return;
    this.spyFrame = requestAnimationFrame(() => {
      this.spyFrame = 0;
      this.anchors?.active.set(this.anchorInView());
    });
  }

  /** The last section scrolled up to `scrollOffset`; at the very bottom, the last one in view. */
  private anchorInView(): string | null {
    const hostTop = this.host.getBoundingClientRect().top;
    const sections = [...(this.anchors?.ids() ?? [])]
      .map((id) => ({ id, section: this.sectionOf(id) }))
      .filter((entry): entry is { id: string; section: HTMLElement } => entry.section !== null)
      .map(({ id, section }) => ({ id, top: section.getBoundingClientRect().top - hostTop }))
      .sort((a, b) => a.top - b.top);

    const { scrollTop, clientHeight, scrollHeight } = this.host;
    // A short last section never reaches the offset: once nothing is left to scroll, it wins.
    if (scrollTop > 0 && scrollTop + clientHeight >= scrollHeight - 1) {
      const inView = sections.filter((s) => s.top < clientHeight);
      if (inView.length) return inView[inView.length - 1].id;
    }
    const reached = sections.filter((s) => s.top <= this.scrollOffset() + 1);
    return reached.length ? reached[reached.length - 1].id : null;
  }

  private sectionOf(id: string): HTMLElement | null {
    return this.host.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  }

  /** The id the URL fragment names; none for a malformed one (`#50%`). */
  private fragmentId(): string {
    try {
      return decodeURIComponent(this.doc.location.hash.slice(1));
    } catch {
      return '';
    }
  }

  /** Points the URL fragment at `#id`, or removes it. */
  private writeFragment(id: string | null): void {
    const view = this.doc.defaultView;
    if (!view) return;
    // The whole URL: a bare `#id` would resolve against the document's `<base href>`, losing the path.
    const url = new URL(this.doc.location.href);
    url.hash = id ? encodeURIComponent(id) : '';
    if (url.href !== this.doc.location.href) view.history.replaceState(view.history.state, '', url.href);
  }
}
