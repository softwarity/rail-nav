import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, PLATFORM_ID, provideZonelessChangeDetection, signal, viewChild } from '@angular/core';
import { RailnavComponent } from './railnav.component';
import { RailnavContainerComponent } from './railnav-container.component';
import { RailnavContentComponent } from './railnav-content.component';
import { RailnavItemComponent } from './railnav-item.component';

// Content 300px high over sections of 400 + 400 + 100px: 600px of scroll, and a last section too
// short to ever reach the top. The sticky header has no height, not to move the sections: only its
// button shows.
@Component({
  template: `
    <rail-nav-container style="display: block; height: 300px">
      <rail-nav>
        @for (id of ids(); track id) {
          <rail-nav-item [label]="id" [anchor]="id"><span>{{ id }}</span></rail-nav-item>
        }
      </rail-nav>
      <rail-nav-content [scrollOffset]="offset()" [anchorFragment]="fragment()">
        <header style="position: sticky; top: 0; height: 0"><button id="menu">Menu</button></header>
        <section id="alpha" style="height: 400px">Alpha</section>
        <section id="beta" style="height: 400px">Beta</section>
        <section id="gamma" style="height: 100px">Gamma</section>
      </rail-nav-content>
    </rail-nav-container>
  `,
  imports: [RailnavContainerComponent, RailnavComponent, RailnavContentComponent, RailnavItemComponent],
})
class ScrollSpyHostComponent {
  ids = signal(['alpha', 'beta', 'gamma']);
  offset = signal(0);
  fragment = signal(false);
  content = viewChild.required(RailnavContentComponent);
}

describe('RailnavContentComponent scroll-spy', () => {
  let component: ScrollSpyHostComponent;
  let fixture: ComponentFixture<ScrollSpyHostComponent>;
  let initialUrl: string;
  let base: HTMLBaseElement | undefined;

  const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));
  const settle = async (): Promise<void> => {
    await nextFrame();
    await nextFrame();
    await fixture.whenStable();
  };
  const scroller = (): HTMLElement => fixture.nativeElement.querySelector('rail-nav-content');
  const scrollTo = async (top: number): Promise<void> => {
    scroller().scrollTop = top;
    scroller().dispatchEvent(new Event('scroll'));
    await settle();
  };
  const activeItems = (): string[] =>
    [...fixture.nativeElement.querySelectorAll('rail-nav-item .rail-item.active .label-below')].map((label: Element) => label.textContent ?? '');
  const itemButton = (label: string): HTMLButtonElement =>
    [...fixture.nativeElement.querySelectorAll('rail-nav-item button.rail-item')].find((b: Element) => b.querySelector('.label-below')?.textContent === label) as HTMLButtonElement;
  /** Navigates to `#id` for real: the browser scrolls to the section on its own. */
  const navigateTo = async (id: string): Promise<void> => {
    const url = new URL(location.href);
    url.hash = id;
    location.replace(url.href);
    await settle();
  };
  /** Renders the host again, as a page opened on `hash`. */
  const reopenAt = async (hash: string, fragment: boolean): Promise<void> => {
    fixture.destroy();
    history.replaceState(history.state, '', hash);
    fixture = TestBed.createComponent(ScrollSpyHostComponent);
    component = fixture.componentInstance;
    component.fragment.set(fragment);
    fixture.autoDetectChanges(true);
    await settle();
  };

  beforeEach(async () => {
    initialUrl = location.href;
    await TestBed.configureTestingModule({
      imports: [ScrollSpyHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollSpyHostComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    history.replaceState(history.state, '', initialUrl);
    base?.remove();
    base = undefined;
  });

  it('should activate the first section at the top', () => {
    expect(component.content().activeAnchor()).toBe('alpha');
    expect(itemButton('alpha').classList.contains('active')).toBe(true);
    expect(itemButton('alpha').getAttribute('aria-current')).toBe('location');
  });

  it('should follow the section scrolled to', async () => {
    await scrollTo(450);
    expect(component.content().activeAnchor()).toBe('beta');
    expect(itemButton('beta').classList.contains('active')).toBe(true);
    expect(itemButton('alpha').classList.contains('active')).toBe(false);
    expect(itemButton('alpha').hasAttribute('aria-current')).toBe(false);
  });

  it('should activate a short last section once nothing is left to scroll', async () => {
    await scrollTo(600);
    expect(component.content().activeAnchor()).toBe('gamma');
  });

  it('should count a section as reached at the scroll offset', async () => {
    await scrollTo(320);
    expect(component.content().activeAnchor()).toBe('alpha');
    component.offset.set(100);
    await settle();
    expect(component.content().activeAnchor()).toBe('beta');
  });

  it('should scroll to the section of a clicked item, which turns active at once', async () => {
    itemButton('beta').click();
    expect(component.content().activeAnchor()).toBe('beta');
    await new Promise((resolve) => setTimeout(resolve, 450));
    await settle();
    expect(Math.round(scroller().scrollTop)).toBe(400);
    expect(activeItems()).toEqual(['beta']);
  });

  it('should stop scrolling to a section as soon as the user scrolls', async () => {
    itemButton('gamma').click();
    for (let frame = 0; frame < 30 && scroller().scrollTop === 0; frame++) await nextFrame();
    scroller().dispatchEvent(new WheelEvent('wheel'));
    const stoppedAt = scroller().scrollTop;
    await new Promise((resolve) => setTimeout(resolve, 450));
    await settle();
    expect(stoppedAt).toBeGreaterThan(0);
    expect(scroller().scrollTop).toBe(stoppedAt);
    // Back to the section actually in view.
    expect(component.content().activeAnchor()).toBe('alpha');
  });

  it('should leave the scroll offset above a section scrolled to', async () => {
    component.offset.set(100);
    await settle();
    component.content().scrollToAnchor('beta', 'instant');
    await settle();
    expect(scroller().scrollTop).toBe(300);
    expect(component.content().activeAnchor()).toBe('beta');
  });

  it('should leave the scroll offset above a section the browser scrolls to on its own', async () => {
    component.offset.set(100);
    await settle();
    // The same scroll as the one a shared link gets from the browser while the page loads.
    await navigateTo('beta');
    expect(scroller().scrollTop).toBe(300);
    expect(component.content().activeAnchor()).toBe('beta');
  });

  it("should leave the page's own scroll margin to a section without a scroll offset", async () => {
    const style = document.head.appendChild(document.createElement('style'));
    style.textContent = 'rail-nav-content section { scroll-margin-top: 50px }';
    await navigateTo('beta');
    style.remove();
    expect(scroller().scrollTop).toBe(350);
  });

  it('should not scroll when the focus moves into a sticky header', async () => {
    component.offset.set(100);
    await scrollTo(450);
    fixture.nativeElement.querySelector('#menu').focus();
    await settle();
    expect(scroller().scrollTop).toBe(450);
  });

  it('should keep the URL fragment untouched by default', async () => {
    await scrollTo(450);
    expect(location.hash).not.toBe('#beta');
  });

  it('should mirror the section in view in the URL fragment when asked, without adding history', async () => {
    const entries = history.length;
    component.fragment.set(true);
    await scrollTo(450);
    expect(location.hash).toBe('#beta');
    expect(history.length).toBe(entries);
  });

  it('should keep the path of the URL when mirroring the section in the fragment', async () => {
    // As in any Angular app: a bare `#id` would resolve against the base, not against the page.
    base = document.head.appendChild(document.createElement('base'));
    base.href = '/';
    const path = location.pathname;
    component.fragment.set(true);
    await scrollTo(450);
    expect(location.hash).toBe('#beta');
    expect(location.pathname).toBe(path);
  });

  it('should drop the fragment from the URL once no section is reached', async () => {
    component.ids.set(['beta', 'gamma']);
    component.fragment.set(true);
    await scrollTo(450);
    expect(location.hash).toBe('#beta');
    await scrollTo(0);
    expect(component.content().activeAnchor()).toBeNull();
    expect(location.href).not.toContain('#');
  });

  it('should leave a fragment that names no section in the URL', async () => {
    component.ids.set(['beta', 'gamma']);
    history.replaceState(history.state, '', '#elsewhere');
    await settle();
    component.fragment.set(true);
    await settle();
    expect(component.content().activeAnchor()).toBeNull();
    expect(location.hash).toBe('#elsewhere');
  });

  it("should open a shared link on its section when asked", async () => {
    await reopenAt('#beta', true);
    expect(scroller().scrollTop).toBe(400);
    expect(component.content().activeAnchor()).toBe('beta');
  });

  it('should ignore a malformed URL fragment', async () => {
    // An error thrown after render is only logged by the ErrorHandler: the test would not fail on it.
    const logged = spyOn(console, 'error');
    await reopenAt('#50%', true);
    expect(logged).not.toHaveBeenCalled();
    expect(scroller().scrollTop).toBe(0);
    expect(component.content().activeAnchor()).toBe('alpha');
  });

  it('should forget the anchor of a removed item', async () => {
    component.ids.set(['alpha', 'beta']);
    await scrollTo(600);
    expect(component.content().activeAnchor()).toBe('beta');
  });
});

describe('RailnavContentComponent scroll-spy on the server', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollSpyHostComponent],
      providers: [provideZonelessChangeDetection(), { provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();
  });

  it('should watch no section', async () => {
    const fixture = TestBed.createComponent(ScrollSpyHostComponent);
    fixture.autoDetectChanges(true);
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    // In a browser, the first section would already be in view.
    expect(fixture.componentInstance.content().activeAnchor()).toBeNull();
  });
});
