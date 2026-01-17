import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, viewChild, provideZonelessChangeDetection, signal } from '@angular/core';
import { RailnavComponent } from './railnav.component';
import { RailnavContainerComponent } from './railnav-container.component';

@Component({
  template: `
    <rail-nav-container [showBackdrop]="showBackdrop()">
      <rail-nav [railPosition]="railPosition()" [collapsedWidth]="collapsedWidth()">
      </rail-nav>
      <div class="test-content">Content</div>
    </rail-nav-container>
  `,
  imports: [RailnavContainerComponent, RailnavComponent]
})
class TestHostComponent {
  showBackdrop = signal(true);
  railPosition = signal<'start' | 'end'>('start');
  collapsedWidth = signal(72);

  container = viewChild.required(RailnavContainerComponent);
  railnav = viewChild.required(RailnavComponent);
}

describe('RailnavContainerComponent', () => {
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

  describe('initialization', () => {
    it('should create', () => {
      expect(component.container()).toBeTruthy();
    });

    it('should have showBackdrop true by default', () => {
      expect(component.showBackdrop()).toBe(true);
    });

    it('should have reference to child railnav', () => {
      expect(component.container().railnav).toBeTruthy();
      expect(component.container().railnav).toBe(component.railnav());
    });
  });

  describe('host classes', () => {
    it('should have mat-drawer-container class', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-container');
      expect(hostEl.classList.contains('mat-drawer-container')).toBe(true);
    });

    it('should have mat-sidenav-container class', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-container');
      expect(hostEl.classList.contains('mat-sidenav-container')).toBe(true);
    });
  });

  describe('content projection', () => {
    it('should project rail-nav', () => {
      const railnavEl = fixture.nativeElement.querySelector('rail-nav');
      expect(railnavEl).toBeTruthy();
    });

    it('should project other content', () => {
      const content = fixture.nativeElement.querySelector('.test-content');
      expect(content).toBeTruthy();
      expect(content.textContent).toBe('Content');
    });
  });

  describe('backdrop', () => {
    it('should render backdrop when showBackdrop is true', () => {
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop).toBeTruthy();
    });

    it('should not render backdrop when showBackdrop is false', async () => {
      component.showBackdrop.set(false);
      await fixture.whenStable();
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop).toBeFalsy();
    });

    it('should not have visible class when collapsed', () => {
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop.classList.contains('visible')).toBe(false);
    });

    it('should have visible class when expanded', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop.classList.contains('visible')).toBe(true);
    });

    it('should have correct left offset for start position', () => {
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop.style.left).toBe('72px');
      expect(backdrop.style.right).toBe('0px');
    });

    it('should have correct right offset for end position', async () => {
      component.railPosition.set('end');
      await fixture.whenStable();
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop.style.left).toBe('0px');
      expect(backdrop.style.right).toBe('72px');
    });

    it('should update offset when collapsedWidth changes', async () => {
      component.collapsedWidth.set(100);
      await fixture.whenStable();
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop.style.left).toBe('100px');
    });

    it('should collapse rail when backdrop is clicked', async () => {
      component.railnav().expand();
      await fixture.whenStable();
      expect(component.railnav().expanded()).toBe(true);

      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      backdrop.click();
      await fixture.whenStable();

      expect(component.railnav().expanded()).toBe(false);
    });

    it('should not have position-end class by default', () => {
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop.classList.contains('position-end')).toBe(false);
    });

    it('should have position-end class when rail position is end', async () => {
      component.railPosition.set('end');
      await fixture.whenStable();
      const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
      expect(backdrop.classList.contains('position-end')).toBe(true);
    });
  });
});

describe('RailnavContainerComponent standalone', () => {
  let fixture: ComponentFixture<RailnavContainerComponent>;
  let component: RailnavContainerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RailnavContainerComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(RailnavContainerComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create without child railnav', () => {
    expect(component).toBeTruthy();
    expect(component.railnav).toBeUndefined();
  });

  it('should have default showBackdrop true', () => {
    expect(component.showBackdrop()).toBe(true);
  });
});

@Component({
  template: `
    <rail-nav-container [showBackdrop]="false">
      <rail-nav></rail-nav>
    </rail-nav-container>
  `,
  imports: [RailnavContainerComponent, RailnavComponent]
})
class TestHostWithoutBackdropComponent {
  container = viewChild.required(RailnavContainerComponent);
  railnav = viewChild.required(RailnavComponent);
}

describe('RailnavContainerComponent without backdrop', () => {
  let fixture: ComponentFixture<TestHostWithoutBackdropComponent>;
  let component: TestHostWithoutBackdropComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostWithoutBackdropComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostWithoutBackdropComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should not render backdrop element', () => {
    const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
    expect(backdrop).toBeFalsy();
  });

  it('should still allow expand/collapse', async () => {
    expect(component.railnav().expanded()).toBe(false);
    component.railnav().expand();
    await fixture.whenStable();
    expect(component.railnav().expanded()).toBe(true);
  });
});

@Component({
  template: `
    <rail-nav-container>
      <rail-nav [collapsedWidth]="customWidth()"></rail-nav>
    </rail-nav-container>
  `,
  imports: [RailnavContainerComponent, RailnavComponent]
})
class TestHostWithCustomWidthComponent {
  customWidth = signal(80);
  container = viewChild.required(RailnavContainerComponent);
  railnav = viewChild.required(RailnavComponent);
}

describe('RailnavContainerComponent with custom collapsed width', () => {
  let fixture: ComponentFixture<TestHostWithCustomWidthComponent>;
  let component: TestHostWithCustomWidthComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostWithCustomWidthComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostWithCustomWidthComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should use custom collapsed width for backdrop offset', () => {
    const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
    expect(backdrop.style.left).toBe('80px');
  });

  it('should update backdrop offset when width changes', async () => {
    component.customWidth.set(100);
    await fixture.whenStable();
    const backdrop = fixture.nativeElement.querySelector('.railnav-backdrop');
    expect(backdrop.style.left).toBe('100px');
  });
});
