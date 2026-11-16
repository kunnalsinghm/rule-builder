import { Component, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectFieldComponent } from '../select-field/select-field';

export interface Rule {
  id: number;
  variation: string;
  source: string;
}

@Component({
  selector: 'app-new-rules',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectFieldComponent],
  templateUrl: './new-rules.html',
  styleUrls: ['./new-rules.css']
})
export class NewRulesComponent implements OnInit {

  private readonly storageKey = 'new-rules-data';

  // The live, editable working set of rules.
  draftRules: Rule[] = [{ id: 1, variation: '', source: '' }];

  currentPage = 1;

  private windowStart = 1;

  variationOptions = ['Variation A', 'Variation B', 'Variation C'];
  sourceOptions = ['Source 1', 'Source 2', 'Source 3'];

  private readonly windowCapacity = 5;

  validationError: string | null = null;

  // Receives whatever was last successfully saved, from the parent.
  rules = input<Rule[]>([]);

  // Emits the validated, saved rules so a parent component can read them.
  rulesSaved = output<Rule[]>();

  ngOnInit(): void {
    this.loadFromStorage();
  }

  get totalPages(): number {
    return this.draftRules.length;
  }

  get currentRule(): Rule {
    return this.draftRules[this.currentPage - 1];
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const windowSize = Math.min(this.windowCapacity, total);
    return Array.from({ length: windowSize }, (_, i) => this.windowStart + i);
  }

  get leftEmptySlots(): number {
    const windowSize = Math.min(this.windowCapacity, this.totalPages);
    return Math.min(2, this.windowCapacity - windowSize);
  }

  // True when the current draft exactly matches what was last saved —
  // used to stop redundant re-saves of identical data.
  get isUnchanged(): boolean {
    const saved = this.rules();
    if (saved.length !== this.draftRules.length) return false;
    return this.draftRules.every((r, i) =>
      saved[i] && saved[i].variation === r.variation && saved[i].source === r.source
    );
  }

  private ensureCurrentVisible(): void {
    const total = this.totalPages;
    const windowSize = Math.min(this.windowCapacity, total);
    if (windowSize === 0) {
      this.windowStart = 1;
      return;
    }
    if (this.currentPage < this.windowStart) {
      this.windowStart = this.currentPage;
    } else if (this.currentPage > this.windowStart + windowSize - 1) {
      this.windowStart = this.currentPage - windowSize + 1;
    }
    this.windowStart = Math.max(1, Math.min(this.windowStart, total - windowSize + 1));
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.draftRules = parsed.map((r: any, i: number) => ({
          id: i + 1,
          variation: typeof r?.variation === 'string' ? r.variation : '',
          source: typeof r?.source === 'string' ? r.source : ''
        }));
        this.currentPage = 1;
        this.windowStart = 1;
      }
    } catch {
      // Corrupted or unavailable storage — silently fall back to the default single rule.
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.draftRules));
    } catch {
      // Storage full or unavailable (e.g. private browsing) — fail silently.
    }
  }

  addRule(): void {
    this.draftRules.push({ id: this.draftRules.length + 1, variation: '', source: '' });
    this.currentPage = this.draftRules.length;
    this.ensureCurrentVisible();
    this.validationError = null;
  }

  removeRule(index: number): void {
    if (this.draftRules.length === 1) return;
    this.draftRules.splice(index, 1);
    this.draftRules.forEach((r, i) => (r.id = i + 1));
    if (this.currentPage > this.draftRules.length) {
      this.currentPage = this.draftRules.length;
    }
    this.ensureCurrentVisible();
    this.validationError = null;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.ensureCurrentVisible();
      this.validationError = null;
    }
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  saveRules(): void {
    if (this.isUnchanged) {
      return;
    }

    const invalidIndex = this.draftRules.findIndex(r => !r.variation || !r.source);

    if (invalidIndex !== -1) {
      this.currentPage = invalidIndex + 1;
      this.ensureCurrentVisible();
      this.validationError = `Rule - ${invalidIndex + 1} is missing required fields.`;
      return;
    }

    this.validationError = null;
    this.saveToStorage();

    const snapshot = this.draftRules.map(r => ({ ...r }));
    console.log('Rules saved:', snapshot);
    this.rulesSaved.emit(snapshot);
  }
}