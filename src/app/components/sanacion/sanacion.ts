import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faChevronDown, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TextPlusComponent } from '../text-plus.component/text-plus.component';

interface HealingItem {
  title: string;
  description: string;
}

@Component({
  selector: 'app-sanacion',
  standalone: true,
  imports: [FontAwesomeModule, TextPlusComponent],
  templateUrl: './sanacion.html',
  styleUrl: './sanacion.css',
})
export class SanacionComponent {
  readonly faChevronDown = faChevronDown;
  readonly faPlus = faPlus;
  readonly faCheck = faCheck;
  readonly faPen = faPen;
  readonly faTrash = faTrash;
  readonly isAdding = signal(false);
  readonly editingTitle = signal<string | null>(null);
  readonly selectedTitle = signal('');
  readonly newTitle = signal('');
  readonly newDescription = signal('');
  readonly activeTextPlus = signal<string | null>(null);
  readonly textPlusValue = signal('');
  readonly items = signal<HealingItem[]>(this.loadItems());

  selectedItem(): HealingItem | undefined {
    return this.items().find((item) => item.title === this.selectedTitle());
  }

  selectItem(event: Event): void {
    this.selectedTitle.set((event.target as HTMLSelectElement).value);
  }

  openForm(): void {
    this.editingTitle.set(null);
    this.newTitle.set('');
    this.newDescription.set('');
    this.isAdding.set(true);
  }

  cancelForm(): void {
    this.isAdding.set(false);
    this.editingTitle.set(null);
  }

  addItem(): void {
    const title = this.newTitle().trim();
    const description = this.newDescription().trim();
    if (!title) return;
    const editing = this.editingTitle();
    const items = editing
      ? this.items().map((item) => item.title === editing ? { title, description } : item)
      : [...this.items(), { title, description }];
    this.items.set(items);
    this.selectedTitle.set(title);
    this.persistItems(items);
    this.isAdding.set(false);
    this.editingTitle.set(null);
  }

  editItem(): void {
    const item = this.selectedItem();
    if (!item) return;
    this.editingTitle.set(item.title);
    this.newTitle.set(item.title);
    this.newDescription.set(item.description);
    this.isAdding.set(true);
  }

  deleteItem(): void {
    const title = this.selectedTitle();
    if (!title) return;
    const items = this.items().filter((item) => item.title !== title);
    this.items.set(items);
    this.selectedTitle.set(items[0]?.title ?? '');
    this.persistItems(items);
  }

  workOnSelected(): void {
    const title = this.selectedTitle();
    if (!title) return;
    this.activeTextPlus.set(title);
    this.textPlusValue.set(this.loadTextValues()[title] ?? '');
  }

  saveTextPlus(): void {
    const title = this.activeTextPlus();
    if (!title) return;
    const values = { ...this.loadTextValues(), [title]: this.textPlusValue() };
    localStorage.setItem('calevradmin-sanacion-text', JSON.stringify(values));
    this.activeTextPlus.set(null);
  }

  private loadTextValues(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem('calevradmin-sanacion-text') ?? '{}') as Record<string, string>;
    } catch {
      return {};
    }
  }

  private loadItems(): HealingItem[] {
    try {
      const items = JSON.parse(localStorage.getItem('calevradmin-sanacion-items') ?? '[]') as HealingItem[];
      if (items.length > 0) {
        this.selectedTitle.set(items[0].title);
      }
      return items;
    } catch {
      return [];
    }
  }

  private persistItems(items: HealingItem[]): void {
    localStorage.setItem('calevradmin-sanacion-items', JSON.stringify(items));
  }
}
