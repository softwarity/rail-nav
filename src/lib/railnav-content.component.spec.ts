import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, viewChild, provideZonelessChangeDetection, signal } from '@angular/core';
import { RailnavContentComponent } from './railnav-content.component';
import { RailnavContainerComponent } from './railnav-container.component';
import { RailnavComponent } from './railnav.component';

@Component({
  template: `
    <rail-nav-container>
      <rail-nav></rail-nav>
      <rail-nav-content
        [collapsedWidth]="collapsedWidth()"
        [railPosition]="railPosition()">
        <div class="test-content">Page Content</div>
      </rail-nav-content>
    </rail-nav-container>
  `,
  imports: [RailnavContainerComponent, RailnavComponent, RailnavContentComponent]
})
class TestHostComponent {
  collapsedWidth = signal(72);
  railPosition = signal<'start' | 'end'>('start');

  content = viewChild.required(RailnavContentComponent);
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

    it('should have default collapsed width of 72', () => {
      expect(component.content().collapsedWidth()).toBe(72);
    });

    it('should have default rail position of start', () => {
      expect(component.content().railPosition()).toBe('start');
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

  describe('custom collapsed width', () => {
    it('should accept custom collapsed width', async () => {
      component.collapsedWidth.set(80);
      await fixture.whenStable();
      expect(component.content().collapsedWidth()).toBe(80);
    });

    it('should update margin-left when collapsed width changes', async () => {
      component.collapsedWidth.set(100);
      await fixture.whenStable();
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.style.marginLeft).toBe('100px');
    });
  });

  describe('start position', () => {
    it('should have margin-left equal to collapsed width', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.style.marginLeft).toBe('72px');
    });

    it('should have margin-right of 0', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.style.marginRight).toBe('0px');
    });

    it('should not have position-end class', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(false);
    });
  });

  describe('end position', () => {
    beforeEach(async () => {
      component.railPosition.set('end');
      await fixture.whenStable();
    });

    it('should accept end position', () => {
      expect(component.content().railPosition()).toBe('end');
    });

    it('should have position-end class', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.classList.contains('position-end')).toBe(true);
    });

    it('should have margin-left of 0', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.style.marginLeft).toBe('0px');
    });

    it('should have margin-right equal to collapsed width', () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.style.marginRight).toBe('72px');
    });

    it('should update margin-right when collapsed width changes', async () => {
      component.collapsedWidth.set(100);
      await fixture.whenStable();
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.style.marginRight).toBe('100px');
    });
  });

  describe('position switching', () => {
    it('should update margins when position changes from start to end', async () => {
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');

      expect(hostEl.style.marginLeft).toBe('72px');
      expect(hostEl.style.marginRight).toBe('0px');

      component.railPosition.set('end');
      await fixture.whenStable();

      expect(hostEl.style.marginLeft).toBe('0px');
      expect(hostEl.style.marginRight).toBe('72px');
    });

    it('should update margins when position changes from end to start', async () => {
      component.railPosition.set('end');
      await fixture.whenStable();

      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');

      expect(hostEl.style.marginLeft).toBe('0px');
      expect(hostEl.style.marginRight).toBe('72px');

      component.railPosition.set('start');
      await fixture.whenStable();

      expect(hostEl.style.marginLeft).toBe('72px');
      expect(hostEl.style.marginRight).toBe('0px');
    });
  });

  describe('edge cases', () => {
    it('should handle zero collapsed width', async () => {
      component.collapsedWidth.set(0);
      await fixture.whenStable();
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.style.marginLeft).toBe('0px');
    });

    it('should handle large collapsed width', async () => {
      component.collapsedWidth.set(200);
      await fixture.whenStable();
      const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
      expect(hostEl.style.marginLeft).toBe('200px');
    });
  });
});

@Component({
  template: `
    <rail-nav-container>
      <rail-nav></rail-nav>
      <rail-nav-content [collapsedWidth]="80" railPosition="end">
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

  it('should have correct margins for end position', () => {
    const hostEl = fixture.nativeElement.querySelector('rail-nav-content');
    expect(hostEl.style.marginLeft).toBe('0px');
    expect(hostEl.style.marginRight).toBe('80px');
  });
});
