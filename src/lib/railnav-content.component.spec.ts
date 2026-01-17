import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, viewChild, provideZonelessChangeDetection, signal } from '@angular/core';
import { RailnavContentComponent } from './railnav-content.component';
import { RailnavContainerComponent } from './railnav-container.component';
import { RailnavComponent } from './railnav.component';

@Component({
  template: `
    <rail-nav-container>
      <rail-nav [position]="railPosition()"></rail-nav>
      <rail-nav-content [position]="contentPosition()">
        <div class="test-content">Page Content</div>
      </rail-nav-content>
    </rail-nav-container>
  `,
  imports: [RailnavContainerComponent, RailnavComponent, RailnavContentComponent]
})
class TestHostComponent {
  railPosition = signal<'start' | 'end'>('start');
  contentPosition = signal<'start' | 'end' | undefined>('start');

  content = viewChild.required(RailnavContentComponent);
  railnav = viewChild.required(RailnavComponent);
}

describe('RailnavContentComponent', () => {
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
      expect(component.content()).toBeTruthy();
    });

    it('should have rail position of start when explicitly set', () => {
      expect(component.content().position()).toBe('start');
    });
  });

  describe('host classes', () => {
    it('should have mat-drawer-content class', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('mat-drawer-content')).toBe(true);
    });

    it('should have mat-sidenav-content class', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('mat-sidenav-content')).toBe(true);
    });

    it('should not have position-end class by default', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(false);
    });
  });

  describe('content projection', () => {
    it('should project content', () => {
      const content = fixture.nativeElement.querySelector('.test-content');
      expect(content).toBeTruthy();
      expect(content.textContent).toBe('Page Content');
    });
  });

  describe('start position', () => {
    it('should not have position-end class', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(false);
    });
  });

  describe('end position', () => {
    beforeEach(async () => {
      component.contentPosition.set('end');
      await fixture.whenStable();
    });

    it('should accept end position', () => {
      expect(component.content().position()).toBe('end');
    });

    it('should have position-end class', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(true);
    });
  });

  describe('position switching', () => {
    it('should toggle position-end class when position changes', async () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(false);

      component.contentPosition.set('end');
      await fixture.whenStable();
      expect(hostEl.classList.contains('position-end')).toBe(true);

      component.contentPosition.set('start');
      await fixture.whenStable();
      expect(hostEl.classList.contains('position-end')).toBe(false);
    });
  });
});

@Component({
  template: `
    <rail-nav-container>
      <rail-nav></rail-nav>
      <rail-nav-content position="end">
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </rail-nav-content>
    </rail-nav-container>
  `,
  imports: [RailnavContainerComponent, RailnavComponent, RailnavContentComponent]
})
class TestHostWithMultipleContentComponent {}

describe('RailnavContentComponent with multiple content elements', () => {
  let fixture: ComponentFixture<TestHostWithMultipleContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostWithMultipleContentComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostWithMultipleContentComponent);
    fixture.autoDetectChanges(true);
    await fixture.whenStable();
  });

  it('should project all content elements', () => {
    const header = fixture.nativeElement.querySelector('header');
    const main = fixture.nativeElement.querySelector('main');
    const footer = fixture.nativeElement.querySelector('footer');

    expect(header).toBeTruthy();
    expect(main).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should have position-end class for end position', () => {
    const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
    expect(hostEl.classList.contains('position-end')).toBe(true);
  });
});

@Component({
  template: `
    <rail-nav-container>
      <rail-nav [position]="railPosition()"></rail-nav>
      <rail-nav-content>
        <div class="test-content">Auto-detect test</div>
      </rail-nav-content>
    </rail-nav-container>
  `,
  imports: [RailnavContainerComponent, RailnavComponent, RailnavContentComponent]
})
class TestHostAutoDetectComponent {
  railPosition = signal<'start' | 'end'>('start');

  content = viewChild.required(RailnavContentComponent);
  railnav = viewChild.required(RailnavComponent);
}

describe('RailnavContentComponent auto-detection from sibling rail-nav', () => {
  let component: TestHostAutoDetectComponent;
  let fixture: ComponentFixture<TestHostAutoDetectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostAutoDetectComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostAutoDetectComponent);
    fixture.autoDetectChanges(true);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('auto-detect position', () => {
    it('should auto-detect position from sibling rail-nav', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(false);
    });

    it('should update class when rail-nav position changes to end', async () => {
      component.railPosition.set('end');
      await fixture.whenStable();
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(true);
    });

    it('should update class when rail-nav position changes back to start', async () => {
      component.railPosition.set('end');
      await fixture.whenStable();

      component.railPosition.set('start');
      await fixture.whenStable();

      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(false);
    });
  });
});
