import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, viewChild, provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RailnavComponent } from './railnav.component';
import { RailnavItemComponent } from './railnav-item.component';

@Component({
  template: `
    <rail-nav [position]="position()">
      <rail-nav-item
        [label]="label()"
        [badge]="badge()"
        [active]="active()"
        [routerLink]="routerLink()"
        (itemClick)="onItemClick()">
        <span class="test-icon">icon</span>
      </rail-nav-item>
    </rail-nav>
  `,
  imports: [RailnavComponent, RailnavItemComponent]
})
class TestHostComponent {
  position = signal<'start' | 'end'>('start');
  label = signal('Test Label');
  badge = signal<string | number | boolean | undefined>(undefined);
  active = signal(false);
  routerLink = signal<string | any[] | undefined>(undefined);
  clickCount = 0;

  railnav = viewChild.required(RailnavComponent);
  railnavItem = viewChild.required(RailnavItemComponent);

  onItemClick(): void {
    this.clickCount++;
  }
}

describe('RailnavItemComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'home', component: TestHostComponent },
          { path: 'settings', component: TestHostComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component.railnavItem()).toBeTruthy();
    });

    it('should render label', () => {
      const labelBelow = fixture.nativeElement.querySelector('.label-below');
      expect(labelBelow.textContent).toBe('Test Label');
    });

    it('should render content projection (icon)', () => {
      const icon = fixture.nativeElement.querySelector('.test-icon');
      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('icon');
    });

    it('should render as button when no routerLink', () => {
      const button = fixture.nativeElement.querySelector('button.rail-item');
      expect(button).toBeTruthy();
    });

    it('should not be active by default', () => {
      expect(component.railnavItem().active()).toBe(false);
    });
  });

  describe('expanded state', () => {
    it('should reflect parent expanded state', async () => {
      expect(component.railnavItem()['expanded']()).toBe(false);
      component.railnav().expand();
      await fixture.whenStable();
      expect(component.railnavItem()['expanded']()).toBe(true);
    });

    it('should add expanded class when parent is expanded', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      const item = fixture.nativeElement.querySelector('.rail-item');
      expect(item.classList.contains('expanded')).toBe(true);
    });

    it('should show inline label when expanded', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      const labelInline = fixture.nativeElement.querySelector('.label-inline');
      expect(labelInline.textContent).toBe('Test Label');
    });
  });

  describe('position', () => {
    it('should reflect parent position', async () => {
      expect(component.railnavItem()['position']()).toBe('start');
      component.position.set('end');
      await fixture.whenStable();
      expect(component.railnavItem()['position']()).toBe('end');
    });

    it('should add position-end class when parent position is end', async () => {
      component.position.set('end');
      await fixture.whenStable();
      const item = fixture.nativeElement.querySelector('.rail-item');
      expect(item.classList.contains('position-end')).toBe(true);
    });

    it('should add position-end class to host when position is end', async () => {
      component.position.set('end');
      await fixture.whenStable();
      const host = fixture.nativeElement.querySelector('rail-nav-item');
      expect(host.classList.contains('position-end')).toBe(true);
    });
  });

  describe('active state', () => {
    it('should add active class when active is true', async () => {
      component.active.set(true);
      await fixture.whenStable();
      const item = fixture.nativeElement.querySelector('.rail-item');
      expect(item.classList.contains('active')).toBe(true);
    });

    it('should not have active class when active is false', () => {
      const item = fixture.nativeElement.querySelector('.rail-item');
      expect(item.classList.contains('active')).toBe(false);
    });
  });

  describe('badge', () => {
    it('should not show badge when undefined', () => {
      const badge = fixture.nativeElement.querySelector('.rail-badge');
      expect(badge).toBeFalsy();
    });

    it('should not show badge when false', async () => {
      component.badge.set(false);
      await fixture.whenStable();
      const badge = fixture.nativeElement.querySelector('.rail-badge');
      expect(badge).toBeFalsy();
    });

    it('should show badge with number', async () => {
      component.badge.set(5);
      await fixture.whenStable();
      const badge = fixture.nativeElement.querySelector('.rail-badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toBe('5');
    });

    it('should show badge with string', async () => {
      component.badge.set('new');
      await fixture.whenStable();
      const badge = fixture.nativeElement.querySelector('.rail-badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toBe('new');
    });

    it('should show dot badge when true', async () => {
      component.badge.set(true);
      await fixture.whenStable();
      const badge = fixture.nativeElement.querySelector('.rail-badge');
      expect(badge).toBeTruthy();
      expect(badge.classList.contains('dot')).toBe(true);
      expect(badge.textContent).toBe('');
    });

    it('should show dot badge when empty string', async () => {
      component.badge.set('');
      await fixture.whenStable();
      const badge = fixture.nativeElement.querySelector('.rail-badge');
      expect(badge).toBeTruthy();
      expect(badge.classList.contains('dot')).toBe(true);
    });

    it('should show badge with zero', async () => {
      component.badge.set(0);
      await fixture.whenStable();
      const badge = fixture.nativeElement.querySelector('.rail-badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toBe('0');
      expect(badge.classList.contains('dot')).toBe(false);
    });
  });

  describe('hasBadge computed', () => {
    it('should return true for number badge', async () => {
      component.badge.set(3);
      await fixture.whenStable();
      expect(component.railnavItem()['hasBadge']()).toBe(true);
    });

    it('should return true for string badge', async () => {
      component.badge.set('test');
      await fixture.whenStable();
      expect(component.railnavItem()['hasBadge']()).toBe(true);
    });

    it('should return true for true badge', async () => {
      component.badge.set(true);
      await fixture.whenStable();
      expect(component.railnavItem()['hasBadge']()).toBe(true);
    });

    it('should return false for false badge', async () => {
      component.badge.set(false);
      await fixture.whenStable();
      expect(component.railnavItem()['hasBadge']()).toBe(false);
    });

    it('should return false for undefined badge', () => {
      expect(component.railnavItem()['hasBadge']()).toBe(false);
    });

    it('should return true for zero badge', async () => {
      component.badge.set(0);
      await fixture.whenStable();
      expect(component.railnavItem()['hasBadge']()).toBe(true);
    });

    it('should return true for empty string badge (dot)', async () => {
      component.badge.set('');
      await fixture.whenStable();
      expect(component.railnavItem()['hasBadge']()).toBe(true);
    });
  });

  describe('isDotBadge computed', () => {
    it('should return true for true badge', async () => {
      component.badge.set(true);
      await fixture.whenStable();
      expect(component.railnavItem()['isDotBadge']()).toBe(true);
    });

    it('should return true for empty string badge', async () => {
      component.badge.set('');
      await fixture.whenStable();
      expect(component.railnavItem()['isDotBadge']()).toBe(true);
    });

    it('should return false for number badge', async () => {
      component.badge.set(5);
      await fixture.whenStable();
      expect(component.railnavItem()['isDotBadge']()).toBe(false);
    });

    it('should return false for string badge', async () => {
      component.badge.set('new');
      await fixture.whenStable();
      expect(component.railnavItem()['isDotBadge']()).toBe(false);
    });
  });

  describe('button click behavior', () => {
    it('should emit itemClick when button is clicked', async () => {
      const button = fixture.nativeElement.querySelector('button.rail-item');
      button.click();
      await fixture.whenStable();
      expect(component.clickCount).toBe(1);
    });

    it('should collapse rail when button is clicked', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      expect(component.railnav().expanded()).toBe(true);

      const button = fixture.nativeElement.querySelector('button.rail-item');
      button.click();
      await fixture.whenStable();

      expect(component.railnav().expanded()).toBe(false);
    });

    it('should emit itemClick multiple times on multiple clicks', async () => {
      const button = fixture.nativeElement.querySelector('button.rail-item');
      button.click();
      button.click();
      button.click();
      await fixture.whenStable();
      expect(component.clickCount).toBe(3);
    });
  });

  describe('pill element', () => {
    it('should render pill element', () => {
      const pill = fixture.nativeElement.querySelector('.rail-item-pill');
      expect(pill).toBeTruthy();
    });

    it('should contain icon wrapper', () => {
      const iconWrapper = fixture.nativeElement.querySelector('.rail-item-icon-wrapper');
      expect(iconWrapper).toBeTruthy();
    });

    it('should contain icon', () => {
      const icon = fixture.nativeElement.querySelector('.rail-item-icon');
      expect(icon).toBeTruthy();
    });
  });
});

describe('RailnavItemComponent with router link', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: '', component: TestHostComponent },
          { path: 'home', component: TestHostComponent },
          { path: 'settings', component: TestHostComponent }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    component.routerLink.set('/home');
    await fixture.whenStable();
  });

  it('should render as anchor when routerLink is provided', () => {
    const anchor = fixture.nativeElement.querySelector('a.rail-item');
    expect(anchor).toBeTruthy();
  });

  it('should not render button when routerLink is provided', () => {
    const button = fixture.nativeElement.querySelector('button.rail-item');
    expect(button).toBeFalsy();
  });

  it('should have routerLink attribute', () => {
    const anchor = fixture.nativeElement.querySelector('a.rail-item');
    expect(anchor.getAttribute('href')).toBe('/home');
  });

  it('should collapse rail when router link is clicked', async () => {
    component.railnav().expand();
    await fixture.whenStable();
    expect(component.railnav().expanded()).toBe(true);

    const anchor = fixture.nativeElement.querySelector('a.rail-item');
    anchor.click();
    await fixture.whenStable();

    expect(component.railnav().expanded()).toBe(false);
  });
});

describe('RailnavItemComponent label variations', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should render both label-below and label-inline', () => {
    const labelBelow = fixture.nativeElement.querySelector('.label-below');
    const labelInline = fixture.nativeElement.querySelector('.label-inline');
    expect(labelBelow).toBeTruthy();
    expect(labelInline).toBeTruthy();
  });

  it('should have same text in both labels', () => {
    const labelBelow = fixture.nativeElement.querySelector('.label-below');
    const labelInline = fixture.nativeElement.querySelector('.label-inline');
    expect(labelBelow.textContent).toBe(labelInline.textContent);
  });

  it('should update label when input changes', async () => {
    component.label.set('New Label');
    await fixture.whenStable();
    const labelBelow = fixture.nativeElement.querySelector('.label-below');
    expect(labelBelow.textContent).toBe('New Label');
  });

  it('should handle empty label', async () => {
    component.label.set('');
    await fixture.whenStable();
    const labelBelow = fixture.nativeElement.querySelector('.label-below');
    expect(labelBelow.textContent).toBe('');
  });
});
