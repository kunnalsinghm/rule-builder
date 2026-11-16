import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-field.html',
  styleUrls: ['./select-field.css']
})
export class SelectFieldComponent {
  @Input() label = '';
  @Input() required = false;
  @Input() options: string[] = [];
  @Input() value = '';
  @Input() name = '';
  @Output() valueChange = new EventEmitter<string>();

  onChange(val: string): void {
    this.value = val;
    this.valueChange.emit(val);
  }
}