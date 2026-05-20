import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DestroyRef, ElementRef, Injectable, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { RailnavComponent } from './railnav.component';

/**
 * One per `RailnavComponent` (provided on its `providers`). Owns the single
 * CDK overlay used to render the currently-open `<rail-nav-drawer>`, and the
 * close timer that lets the cursor travel between the trigger item and the
 * drawer without the drawer closing on transit.
 *
 * - Anchors the overlay to the rail's host element (right edge), so the drawer
 *   sits next to the collapsed rail regardless of which trigger item opened it.
 * - Auto-closes when the rail enters `expanded()` mode (mutual exclusion).
 * - Mouse enter/leave on the overlay panel itself cancels/arms the close timer,
 *   so the drawer stays open while the cursor is over it.
 */
@Injectable()
export class RailnavDrawerOrchestrator {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly rail = inject(RailnavComponent);
  private readonly railEl = inject(ElementRef<HTMLElement>);

  /** Window after which we close if nothing cancels — covers cursor transit. */
  private static readonly LEAVE_DELAY_MS = 300;
  /** Post-open grace period during which `armClose()` is a no-op. Touch devices
   * dispatch a burst of synthetic mouse events (with `pointerType === 'mouse'`)
   * right after `click` — this window swallows them. */
  private static readonly SYNTHETIC_GUARD_MS = 500;

  private overlayRef?: OverlayRef;
  private currentTemplate?: TemplateRef<unknown>;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private resizeObserver?: ResizeObserver;
  private outsideClickSub?: Subscription;
  /** Timestamp of the last `open()` — used to gate close-on-leave so that
   * synthetic `mouseleave` events dispatched right after a touch tap
   * (with `pointerType === 'mouse'`) don't shut the drawer instantly. */
  private lastOpenAt = 0;

  constructor() {
    // Mutual exclusion with the rail's expanded mode: expanding closes any open
    // drawer, and `open()` short-circuits while expanded. The expanded rail is
    // itself the alternative nav surface, no point stacking a drawer on top.
    effect(() => {
      if (this.rail.expanded()) this.closeNow();
    });
    inject(DestroyRef).onDestroy(() => {
      this.clearCloseTimer();
      this.overlayRef?.dispose();
    });
  }

  /** Opens or re-targets the overlay to the given template. No-op while the
   * rail is expanded. Cancels any pending close timer (e.g. user hovered back
   * from a quick traverse). When the overlay is already open, re-targets it
   * to the new template WITHOUT disposing — the chrome (bg/shadow/position)
   * stays put while just the projected content fades in. */
  open(template: TemplateRef<unknown>): void {
    if (this.rail.expanded()) return;
    this.clearCloseTimer();
    if (this.currentTemplate === template && this.overlayRef?.hasAttached()) {
      return;
    }

    // Re-target: existing overlay stays, just swap the portal content.
    // Note: we do NOT reset `lastOpenAt` here — otherwise hovering a
    // non-trigger item right after a re-target would be blocked by the
    // synthetic-event guard, leaving the drawer stuck open.
    if (this.overlayRef?.hasAttached()) {
      // Cross-fade: fade the OLD content out first (children only, so the
      // panel chrome/bg stays opaque the whole time — no flicker), then swap
      // and fade the new content in. Reads as "content dissolves, new content
      // appears" with the drawer staying perfectly still.
      this.fadeOutContent().then(() => {
        if (!this.overlayRef) return;
        this.overlayRef.detach();
        this.currentTemplate = template;
        this.overlayRef.attach(new TemplatePortal(template, this.vcr));
        this.applyHeight();
        this.animateContentIn();
      });
      return;
    }

    // First open: arm the synthetic-event guard and build a fresh overlay.
    this.lastOpenAt = performance.now();
    this.detach();
    this.currentTemplate = template;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.railEl)
      .withPositions([
        { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top' },
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      panelClass: 'rail-nav-drawer-panel',
      // Reposition on every scroll so the drawer stays glued to the rail
      // when the page scrolls (default `noop` strategy leaves the overlay
      // fixed to the viewport, which visually decouples it from the rail).
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    // Tap / click outside the overlay closes it — except when the click
    // lands in the rail itself (re-clicking a `[for]` item should re-target
    // or no-op, not close). Crucial on touch where hover-leave doesn't fire.
    this.outsideClickSub = this.overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target as Node | null;
      if (target && this.railEl.nativeElement.contains(target)) return;
      this.closeNow();
    });

    // Keep the drawer open while the cursor is over it; close shortly after
    // it leaves (matching the trigger's own leave debounce). pointer* events
    // let us ignore the synthetic mouseleave fired around touch taps.
    this.overlayRef.overlayElement.addEventListener('pointerenter', this.onOverlayEnter);
    this.overlayRef.overlayElement.addEventListener('pointerleave', this.onOverlayLeave);

    // Inline-style the panel: the projected template content lives outside any
    // component tree, so component-encapsulated styles can't reach it without
    // ::ng-deep / Encapsulation.None. Setting styles directly on overlayElement
    // sidesteps the issue entirely. Each value reads a CSS custom property so
    // consumers can override via `--rail-nav-drawer-*` on the rail.
    //
    // The lib applies both the chrome (background / shadow / radius) AND the
    // default nav-list layout (flex column / padding / gap / min-width) so the
    // consumer's template can be just a flat list of children — they stack
    // vertically with proper spacing out of the box.
    const el = this.overlayRef.overlayElement;
    el.style.background = 'var(--rail-nav-drawer-surface, var(--mat-sys-surface))';
    el.style.color = 'var(--rail-nav-drawer-on-surface, var(--mat-sys-on-surface))';
    el.style.boxShadow = 'var(--rail-nav-drawer-shadow, var(--mat-sys-level2))';
    el.style.borderRadius = 'var(--rail-nav-drawer-radius, 0 12px 12px 0)';
    el.style.overflow = 'auto';
    el.style.boxSizing = 'border-box';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.padding = 'var(--rail-nav-drawer-padding, 12px)';
    el.style.gap = 'var(--rail-nav-drawer-gap, 4px)';
    // Fixed width so the drawer doesn't shrink-fit its content (which would
    // make each trigger's drawer a different size) and absorbs the layout
    // variance between MatButton variants (e.g. text vs tonal padding).
    el.style.width = 'var(--rail-nav-drawer-width, 240px)';

    this.overlayRef.attach(new TemplatePortal(template, this.vcr));
    this.animateIn();

    // Match the rail's full height so the drawer sits flush against it
    // regardless of viewport / layout. ResizeObserver keeps it in sync.
    this.applyHeight();
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.applyHeight());
    this.resizeObserver.observe(this.railEl.nativeElement);
  }

  private applyHeight(): void {
    if (!this.overlayRef) return;
    const rect = this.railEl.nativeElement.getBoundingClientRect();
    this.overlayRef.overlayElement.style.height = `${rect.height}px`;
  }

  /** Slide-in fade on the whole overlay panel — used for the FIRST open, when
   * the drawer genuinely appears from the rail. Web Animations API so no
   * global CSS keyframes. Material standard easing for an organic feel. */
  private animateIn(): void {
    if (!this.overlayRef) return;
    this.overlayRef.overlayElement.animate(
      [
        { opacity: 0, transform: 'translateX(-8px)' },
        { opacity: 1, transform: 'translateX(0)' },
      ],
      { duration: 280, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    );
  }

  /** Fade-in of just the content (panel children) — second half of the
   * re-target cross-fade. Panel chrome stays fixed. */
  private animateContentIn(): void {
    if (!this.overlayRef) return;
    for (const child of Array.from(this.overlayRef.overlayElement.children)) {
      (child as HTMLElement).animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 160, easing: 'ease-out' },
      );
    }
  }

  /** Fade-out of just the content (panel children) — first half of the
   * re-target cross-fade. Resolves once faded so the caller can swap the
   * template while it's invisible. Panel chrome (bg/shadow) stays opaque, so
   * there's no flicker. Resolves immediately if there's nothing to fade. */
  private fadeOutContent(): Promise<void> {
    if (!this.overlayRef) return Promise.resolve();
    const children = Array.from(this.overlayRef.overlayElement.children) as HTMLElement[];
    if (children.length === 0) return Promise.resolve();
    const anims = children.map((c) =>
      c.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 120,
        easing: 'ease-in',
        fill: 'forwards',
      }),
    );
    return Promise.all(anims.map((a) => a.finished)).then(() => undefined);
  }

  /** Arms the close timer. Cancelled if the cursor returns to the trigger or
   * enters the overlay before it fires. Suppressed during the post-open guard
   * window so synthetic mouseleave events fired right after a touch tap
   * don't shut the drawer instantly. */
  armClose(): void {
    if (performance.now() - this.lastOpenAt < RailnavDrawerOrchestrator.SYNTHETIC_GUARD_MS) {
      return;
    }
    this.clearCloseTimer();
    this.closeTimer = setTimeout(
      () => this.closeNow(),
      RailnavDrawerOrchestrator.LEAVE_DELAY_MS,
    );
  }

  /** Force-close immediately, e.g. on a click inside the drawer that navigates. */
  closeNow(): void {
    this.clearCloseTimer();
    this.detach();
  }

  private detach(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.outsideClickSub?.unsubscribe();
    this.outsideClickSub = undefined;
    if (!this.overlayRef) return;
    this.overlayRef.overlayElement.removeEventListener('pointerenter', this.onOverlayEnter);
    this.overlayRef.overlayElement.removeEventListener('pointerleave', this.onOverlayLeave);
    // dispose (not just detach) so the next `open()` builds a fresh overlay
    // with its own position strategy + listeners — no stale state to leak.
    this.overlayRef.dispose();
    this.overlayRef = undefined;
    this.currentTemplate = undefined;
  }

  private clearCloseTimer(): void {
    if (this.closeTimer !== undefined) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }

  // Arrow-functions so the listener references stay stable across add/remove.
  // Touch / pen pointers are ignored — those flows are click-driven.
  private readonly onOverlayEnter = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    this.clearCloseTimer();
  };
  private readonly onOverlayLeave = (event: PointerEvent): void => {
    if (event.pointerType !== 'mouse') return;
    this.armClose();
  };
}
