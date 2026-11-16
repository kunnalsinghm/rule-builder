import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewRulesComponent } from './new-rules';

describe('NewRulesComponent', () => {
  let component: NewRulesComponent;
  let fixture: ComponentFixture<NewRulesComponent>;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [NewRulesComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NewRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('starts with exactly one empty rule', () => {
      expect(component.draftRules.length).toBe(1);
      expect(component.draftRules[0]).toEqual({ id: 1, variation: '', source: '' });
    });

    it('starts on page 1', () => {
      expect(component.currentPage).toBe(1);
    });

    it('currentRule returns the first rule', () => {
      expect(component.currentRule).toBe(component.draftRules[0]);
    });
  });

  describe('addRule', () => {
    it('adds a new rule and navigates to it', () => {
      component.addRule();
      expect(component.draftRules.length).toBe(2);
      expect(component.draftRules[1].id).toBe(2);
      expect(component.currentPage).toBe(2);
    });

    it('clears any existing validation error', () => {
      component.validationError = 'Some error';
      component.addRule();
      expect(component.validationError).toBeNull();
    });

    it('assigns sequential ids when adding multiple rules', () => {
      component.addRule();
      component.addRule();
      component.addRule();
      expect(component.draftRules.map(r => r.id)).toEqual([1, 2, 3, 4]);
    });
  });

  describe('removeRule', () => {
    it('does nothing when only one rule exists', () => {
      component.removeRule(0);
      expect(component.draftRules.length).toBe(1);
    });

    it('removes the specified rule and re-indexes remaining ids', () => {
      component.addRule();
      component.addRule();
      component.removeRule(1);
      expect(component.draftRules.length).toBe(2);
      expect(component.draftRules.map(r => r.id)).toEqual([1, 2]);
    });

    it('clamps currentPage down if it now exceeds the new total', () => {
      component.addRule();
      component.addRule();
      component.removeRule(2);
      expect(component.currentPage).toBe(2);
    });

    it('clears any existing validation error', () => {
      component.addRule();
      component.validationError = 'Some error';
      component.removeRule(0);
      expect(component.validationError).toBeNull();
    });
  });

  describe('navigation: goToPage / prevPage / nextPage', () => {
    beforeEach(() => {
      component.addRule();
      component.addRule();
    });

    it('goToPage moves to a valid page', () => {
      component.goToPage(2);
      expect(component.currentPage).toBe(2);
    });

    it('goToPage ignores out-of-range values', () => {
      component.goToPage(99);
      expect(component.currentPage).toBe(3);
      component.goToPage(0);
      expect(component.currentPage).toBe(3);
    });

    it('prevPage and nextPage stop at the boundaries', () => {
      component.goToPage(1);
      component.prevPage();
      expect(component.currentPage).toBe(1);

      component.goToPage(3);
      component.nextPage();
      expect(component.currentPage).toBe(3);
    });
  });

  describe('visiblePages window (sliding behavior)', () => {
    it('shows all pages without sliding when total is 5 or fewer', () => {
      component.addRule();
      component.addRule();
      component.addRule();
      expect(component.visiblePages).toEqual([1, 2, 3, 4]);
    });

    it('slides the window forward when adding past 5 rules', () => {
      for (let i = 0; i < 6; i++) {
        component.addRule();
      }
      expect(component.totalPages).toBe(7);
      expect(component.currentPage).toBe(7);
      expect(component.visiblePages).toEqual([3, 4, 5, 6, 7]);
    });

    it('does NOT recenter when clicking a page already visible in the window', () => {
      for (let i = 0; i < 6; i++) {
        component.addRule();
      }
      component.goToPage(3);
      expect(component.currentPage).toBe(3);
      expect(component.visiblePages).toEqual([3, 4, 5, 6, 7]);
    });

    it('slides the window left by one when prevPage moves below the visible range', () => {
      for (let i = 0; i < 6; i++) {
        component.addRule();
      }
      component.goToPage(3);
      component.prevPage();
      expect(component.currentPage).toBe(2);
      expect(component.visiblePages).toEqual([2, 3, 4, 5, 6]);
    });
  });

  describe('leftEmptySlots', () => {
    it('reserves 2 empty slots for 1 total rule', () => {
      expect(component.leftEmptySlots).toBe(2);
    });

    it('keeps 2 empty slots for 2 and 3 total rules', () => {
      component.addRule();
      expect(component.leftEmptySlots).toBe(2);
      component.addRule();
      expect(component.leftEmptySlots).toBe(2);
    });

    it('reduces to 1 empty slot for 4 total rules', () => {
      component.addRule();
      component.addRule();
      component.addRule();
      expect(component.leftEmptySlots).toBe(1);
    });

    it('has 0 empty slots once there are 5 or more rules', () => {
      for (let i = 0; i < 4; i++) {
        component.addRule();
      }
      expect(component.leftEmptySlots).toBe(0);
    });
  });

  describe('saveRules', () => {
    it('sets a validation error and navigates to the first incomplete rule', () => {
      component.addRule();
      component.draftRules[0].variation = 'Variation A';
      component.draftRules[0].source = 'Source 1';

      component.saveRules();

      expect(component.validationError).toContain('Rule - 2');
      expect(component.currentPage).toBe(2);
    });

    it('clears validation error and writes to localStorage when all rules are valid', () => {
      component.draftRules[0].variation = 'Variation A';
      component.draftRules[0].source = 'Source 1';

      component.saveRules();

      expect(component.validationError).toBeNull();
      const stored = JSON.parse(localStorage.getItem('new-rules-data') || '[]');
      expect(stored).toEqual([{ id: 1, variation: 'Variation A', source: 'Source 1' }]);
    });
  });

  describe('loading from localStorage', () => {
    it('restores previously saved rules on init', () => {
      const saved = [
        { id: 1, variation: 'Variation B', source: 'Source 2' },
        { id: 2, variation: 'Variation C', source: 'Source 3' }
      ];
      localStorage.setItem('new-rules-data', JSON.stringify(saved));

      const newFixture = TestBed.createComponent(NewRulesComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.draftRules).toEqual(saved);
      expect(newComponent.currentPage).toBe(1);
    });

    it('falls back to the default single rule when storage is empty', () => {
      const newFixture = TestBed.createComponent(NewRulesComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.draftRules).toEqual([{ id: 1, variation: '', source: '' }]);
    });

    it('falls back gracefully when storage contains invalid JSON', () => {
      localStorage.setItem('new-rules-data', 'not valid json{{{');

      const newFixture = TestBed.createComponent(NewRulesComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.draftRules).toEqual([{ id: 1, variation: '', source: '' }]);
    });
  });
});