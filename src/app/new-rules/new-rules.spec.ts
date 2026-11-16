import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { NewRulesComponent, Rule } from './new-rules';

function createFakeStorage() {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => { store[k] = String(v); },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
}

describe('NewRulesComponent', () => {
  beforeEach(async () => {
    vi.stubGlobal('localStorage', createFakeStorage());
    await TestBed.configureTestingModule({
      imports: [NewRulesComponent],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with one empty rule', () => {
    const c = TestBed.createComponent(NewRulesComponent).componentInstance;
    expect(c.draftRules.length).toBe(1);
  });

  it('adds a rule and moves to it', () => {
    const c = TestBed.createComponent(NewRulesComponent).componentInstance;
    c.addRule();
    expect(c.totalPages).toBe(2);
    expect(c.currentPage).toBe(2);
  });

  it('blocks save when fields are missing', () => {
    const c = TestBed.createComponent(NewRulesComponent).componentInstance;
    c.saveRules();
    expect(c.validationError).toBe('Rule - 1 is missing required fields.');
  });

  it('emits and persists valid rules', () => {
    const c = TestBed.createComponent(NewRulesComponent).componentInstance;
    let emitted: Rule[] | undefined;
    c.rulesSaved.subscribe(r => (emitted = r));

    c.draftRules[0].variation = 'Variation A';
    c.draftRules[0].source = 'Source 1';
    c.saveRules();

    expect(c.validationError).toBeNull();
    expect(emitted?.length).toBe(1);
    expect(localStorage.getItem('new-rules-data')).toContain('Variation A');
  });
});
