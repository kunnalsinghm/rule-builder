# Rule Builder

An Angular component for creating a list of rules, one rule at a time. Each rule needs a **Variation** and a **Source**. Rules are paginated, validated on save, persisted to `localStorage`, and emitted to a parent component.

Built with Angular 21 standalone components.

## Features

- **One rule per page:** each rule is a card with its own page number, so long lists stay compact
- **Add and remove rules:** the `+` button adds a rule and jumps to it, and the `Ã—` button removes the current rule (the last remaining rule can't be removed)
- **Sliding pagination:** shows up to 5 page buttons at a time, keeps the active page in view, and has previous and next arrows
- **Required-field validation:** saving checks every rule, jumps to the first incomplete one and shows a message such as `Rule - 3 is missing required fields.`
- **Smart Save button:** disabled when the draft is identical to the last saved rules, which prevents redundant saves
- **Persistence:** saved rules are stored in `localStorage` (key: `new-rules-data`) and restored on load
- **Parent integration:** emits the saved rules through an output and accepts the last saved rules through an input
- **Reusable select:** a small `SelectFieldComponent` with a label, required marker and two-way binding

## Getting Started

### Prerequisites

- A current LTS version of [Node.js](https://nodejs.org) (check the versions supported by Angular 21)
- npm

### Install and run

```bash
git clone https://github.com/kunnalsinghm/rule-builder.git
cd rule-builder
npm install
ng serve
```

Open <http://localhost:4200/>.

### Icons

The templates use [Material Symbols](https://fonts.google.com/icons) (`material-symbols-outlined`). Make sure the font is loaded in `src/index.html`:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
/>
```

## Usage

Import the component and place it in a parent template. Example:

```ts
import { Component } from '@angular/core';
import { NewRulesComponent, Rule } from './new-rules/new-rules';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NewRulesComponent],
  template: `
    <app-new-rules
      [rules]="savedRules"
      (rulesSaved)="onRulesSaved($event)">
    </app-new-rules>
  `
})
export class App {
  savedRules: Rule[] = [];

  onRulesSaved(rules: Rule[]) {
    this.savedRules = rules;
    // send to your API, update state, etc.
  }
}
```

## Component API

### `NewRulesComponent` (`<app-new-rules>`)

| Name | Kind | Type | Description |
| --- | --- | --- | --- |
| `rules` | input | `Rule[]` | The last successfully saved rules. Used to disable Save when nothing has changed. |
| `rulesSaved` | output | `Rule[]` | Emits a snapshot of all rules after they pass validation. |

```ts
export interface Rule {
  id: number;        // 1-based position, reassigned when rules are removed
  variation: string;
  source: string;
}
```

Dropdown options are currently defined inside the component:

```ts
variationOptions = ['Variation A', 'Variation B', 'Variation C'];
sourceOptions    = ['Source 1', 'Source 2', 'Source 3'];
```

### `SelectFieldComponent` (`<app-select-field>`)

| Name | Kind | Type | Description |
| --- | --- | --- | --- |
| `label` | input | `string` | Field label |
| `required` | input | `boolean` | Marks the field as required |
| `options` | input | `string[]` | Dropdown options |
| `value` | input | `string` | Selected value |
| `name` | input | `string` | Field name or id |
| `valueChange` | output | `string` | Emits the newly selected value, so it supports `[(value)]` |

```html
<app-select-field
  label="Variation"
  [required]="true"
  [options]="variationOptions"
  [(value)]="rule.variation"
  name="variation-1">
</app-select-field>
```

## How It Works

1. **Draft state:** edits happen on `draftRules`, a working copy that is separate from the saved rules.
2. **Save:** `saveRules()` does nothing if the draft is unchanged. Otherwise it finds the first rule missing a variation or source, jumps to that page and shows an error. If everything is valid, it writes to `localStorage` and emits `rulesSaved`.
3. **Load:** on init, the component reads `localStorage` and restores the draft. Corrupted or unavailable storage falls back to a single empty rule.

## Project Structure

```text
src/app/
â”œâ”€â”€ new-rules/
â”‚   â”œâ”€â”€ new-rules.ts        # Rule list logic, pagination, validation, persistence
â”‚   â”œâ”€â”€ new-rules.html      # Rule card, pagination and Save button
â”‚   â”œâ”€â”€ new-rules.css
â”‚   â””â”€â”€ new-rules.spec.ts   # Unit tests
â”œâ”€â”€ select-field/
â”‚   â”œâ”€â”€ select-field.ts     # Reusable labelled select
â”‚   â”œâ”€â”€ select-field.html
â”‚   â””â”€â”€ select-field.css
â”œâ”€â”€ app.ts                  # Root component
â””â”€â”€ app.html
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm test` | Run unit tests with Vitest |

## Roadmap

- [ ] Accept `variationOptions` and `sourceOptions` as inputs instead of hard-coding them
- [ ] Per-field error messages next to the invalid select
- [ ] Confirm before removing a rule
- [x] Unit tests for validation and persistence (pagination still to do)
- [ ] Backend or API persistence

## License

No license has been chosen yet. Add a `LICENSE` file (for example, MIT) before accepting outside contributions.

## Author

**Kunal Singh Munda**: [@kunnalsinghm](https://github.com/kunnalsinghm)
