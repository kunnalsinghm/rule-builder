import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewRulesComponent, Rule } from './new-rules/new-rules';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NewRulesComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  savedRules: Rule[] = [];
  showToast = false;

  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  onRulesSaved(rules: Rule[]): void {
    this.savedRules = rules;
    this.triggerToast();
  }

  dismissToast(): void {
    this.showToast = false;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
  }

  private triggerToast(): void {
    this.showToast = true;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this.toastTimeoutId = setTimeout(() => {
      this.showToast = false;
    }, 2500);
  }
}