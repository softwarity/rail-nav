import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, viewChild, provideZonelessChangeDetection, signal } from '@angular/core';
import { RailnavComponent } from './railnav.component';

describe('RailnavComponent', () => {
  let component: RailnavComponent;
  let fixture: ComponentFixture<RailnavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RailnavComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(RailnavComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default collapsed width of 72', () => {
      expect(component.collapsedWidth()).toBe(72);
    });

    it('should have default expanded width of auto', () => {
      expect(component.expandedWidth()).toBe('auto');
    });

    it('should have default rail position of start', () => {
      expect(component.railPosition()).toBe('start');
    });

    it('should have default header height of 56', () => {
      expect(component.headerHeight()).toBe(56);
    });

    it('should not hide default header by default', () => {
      expect(component.hideDefaultHeader()).toBe(false);
    });

    it('should start collapsed', () => {
      expect(component.expanded()).toBe(false);
    });

    it('should have sidenav opened by default', () => {
      expect(component.opened).toBe(true);
    });

    it('should have disableClose set to true', () => {
      expect(component.disableClose).toBe(true);
    });

    it('should have mode set to side when collapsed', () => {
      expect(component.mode).toBe('side');
    });
  });

  describe('expand/collapse behavior', () => {
    it('should expand when toggleExpanded is called', () => {
      component.toggleExpanded();
      expect(component.expanded()).toBe(true);
    });

    it('should collapse when toggleExpanded is called twice', () => {
      component.toggleExpanded();
      component.toggleExpanded();
      expect(component.expanded()).toBe(false);
    });

    it('should expand when expand() is called', () => {
      component.expand();
      expect(component.expanded()).toBe(true);
    });

    it('should collapse when collapse() is called', () => {
      component.expand();
      component.collapse();
      expect(component.expanded()).toBe(false);
    });

    it('should remain collapsed when collapse() is called on collapsed state', () => {
      component.collapse();
      expect(component.expanded()).toBe(false);
    });

    it('should remain expanded when expand() is called on expanded state', () => {
      component.expand();
      component.expand();
      expect(component.expanded()).toBe(true);
    });

    it('should switch mode to over when expanded', async () => {
      component.expand();
      await fixture.whenStable();
      expect(component.mode).toBe('over');
    });

    it('should switch mode back to side when collapsed', async () => {
      component.expand();
      await fixture.whenStable();
      component.collapse();
      await fixture.whenStable();
      expect(component.mode).toBe('side');
    });
  });

  describe('computed width', () => {
    it('should return collapsed width in px when collapsed', () => {
      expect(component['computedWidth']()).toBe('72px');
    });

    it('should return fit-content when expanded with auto width', () => {
      component.expand();
      expect(component['computedWidth']()).toBe('fit-content');
    });
  });

  describe('host classes', () => {
    it('should have mat-drawer and mat-sidenav classes', () => {
      const hostEl = fixture.nativeElement;
      expect(hostEl.classList.contains('mat-drawer')).toBe(true);
      expect(hostEl.classList.contains('mat-sidenav')).toBe(true);
    });

    it('should add expanded class when expanded', async () => {
      component.expand();
      await fixture.whenStable();
      const hostEl = fixture.nativeElement;
      expect(hostEl.classList.contains('expanded')).toBe(true);
    });

    it('should not have expanded class when collapsed', () => {
      const hostEl = fixture.nativeElement;
      expect(hostEl.classList.contains('expanded')).toBe(false);
    });

    it('should not have position-end class by default', () => {
      const hostEl = fixture.nativeElement;
      expect(hostEl.classList.contains('position-end')).toBe(false);
    });
  });

  describe('header rendering', () => {
    it('should render header by default', () => {
      const header = fixture.nativeElement.querySelector('.rail-header');
      expect(header).toBeTruthy();
    });

    it('should render burger menu icon', () => {
      const burger = fixture.nativeElement.querySelector('.rail-burger');
      expect(burger).toBeTruthy();
    });

    it('should render menu icon svg', () => {
      const menuIcon = fixture.nativeElement.querySelector('.icon-menu');
      expect(menuIcon).toBeTruthy();
    });

    it('should render menu-open icon svg', () => {
      const menuOpenIcon = fixture.nativeElement.querySelector('.icon-menu-open');
      expect(menuOpenIcon).toBeTruthy();
    });

    it('should not render branding when no title or subtitle', () => {
      const branding = fixture.nativeElement.querySelector('.rail-branding');
      expect(branding).toBeFalsy();
    });

    it('should add expanded class to burger when expanded', async () => {
      component.expand();
      await fixture.whenStable();
      const burger = fixture.nativeElement.querySelector('.rail-burger');
      expect(burger.classList.contains('expanded')).toBe(true);
    });
  });

  describe('header click', () => {
    it('should toggle expanded state when header is clicked', async () => {
      const header = fixture.nativeElement.querySelector('.rail-header');
      header.click();
      await fixture.whenStable();
      expect(component.expanded()).toBe(true);
    });
  });
});

@Component({
  template: `
    <rail-nav
      [collapsedWidth]="collapsedWidth()"
      [expandedWidth]="expandedWidth()"
      [railPosition]="railPosition()"
      [title]="title()"
      [subtitle]="subtitle()"
      [headerHeight]="headerHeight()"
      [hideDefaultHeader]="hideDefaultHeader()">
    </rail-nav>
  `,
  imports: [RailnavComponent]
})
class TestHostComponent {
  collapsedWidth = signal(80);
  expandedWidth = signal<number | 'auto'>(240);
  railPosition = signal<'start' | 'end'>('start');
  title = signal('Test Title');
  subtitle = signal('Test Subtitle');
  headerHeight = signal(64);
  hideDefaultHeader = signal(false);

  railnav = viewChild.required(RailnavComponent);
}

describe('RailnavComponent with inputs', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should accept custom collapsed width', () => {
    expect(component.railnav().collapsedWidth()).toBe(80);
  });

  it('should accept custom expanded width', () => {
    expect(component.railnav().expandedWidth()).toBe(240);
  });

  it('should accept custom rail position', async () => {
    component.railPosition.set('end');
    await fixture.whenStable();
    expect(component.railnav().railPosition()).toBe('end');
  });

  it('should accept custom header height', () => {
    expect(component.railnav().headerHeight()).toBe(64);
  });

  it('should accept custom title', () => {
    expect(component.railnav().title()).toBe('Test Title');
  });

  it('should accept custom subtitle', () => {
    expect(component.railnav().subtitle()).toBe('Test Subtitle');
  });

  describe('with numeric expanded width', () => {
    it('should return numeric width in px when expanded', () => {
      component.railnav().expand();
      expect(component.railnav()['computedWidth']()).toBe('240px');
    });

    it('should return collapsed width when collapsed', () => {
      expect(component.railnav()['computedWidth']()).toBe('80px');
    });
  });

  describe('with title and subtitle', () => {
    it('should render branding when expanded with title', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      const branding = fixture.nativeElement.querySelector('.rail-branding');
      expect(branding).toBeTruthy();
    });

    it('should render title when expanded', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      const title = fixture.nativeElement.querySelector('.rail-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Test Title');
    });

    it('should render subtitle when expanded', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      const subtitle = fixture.nativeElement.querySelector('.rail-subtitle');
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toBe('Test Subtitle');
    });

    it('should not render branding when collapsed', () => {
      const branding = fixture.nativeElement.querySelector('.rail-branding');
      expect(branding).toBeFalsy();
    });
  });

  describe('with position end', () => {
    beforeEach(async () => {
      component.railPosition.set('end');
      await fixture.whenStable();
    });

    it('should add position-end class to host', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav');
      expect(hostEl.classList.contains('position-end')).toBe(true);
    });

    it('should add position-end class to header', () => {
      const header = fixture.nativeElement.querySelector('.rail-header');
      expect(header.classList.contains('position-end')).toBe(true);
    });

    it('should add position-end class to burger', () => {
      const burger = fixture.nativeElement.querySelector('.rail-burger');
      expect(burger.classList.contains('position-end')).toBe(true);
    });

    it('should render branding before burger when expanded and position end', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      const header = fixture.nativeElement.querySelector('.rail-header');
      const branding = header.querySelector('.rail-branding');
      const burger = header.querySelector('.rail-burger');

      const brandingIndex = Array.from(header.children).indexOf(branding);
      const burgerIndex = Array.from(header.children).indexOf(burger);
      expect(brandingIndex).toBeLessThan(burgerIndex);
    });
  });

  describe('with hidden header', () => {
    it('should not render header when hideDefaultHeader is true', async () => {
      component.hideDefaultHeader.set(true);
      await fixture.whenStable();
      const header = fixture.nativeElement.querySelector('.rail-header');
      expect(header).toBeFalsy();
    });
  });
});
