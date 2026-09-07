import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faChevronDown, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TextPlusComponent } from '../text-plus.component/text-plus.component';

interface TaskRow {
  select: string;
  header: string;
}

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [FontAwesomeModule, TextPlusComponent],
  templateUrl: './tareas.html',
  styleUrl: './tareas.css',
})
export class TareasComponent {
  readonly faPen = faPen;
  readonly faCheck = faCheck;
  readonly faChevronDown = faChevronDown;
  readonly faPlus = faPlus;
  readonly isEditing = signal(false);
  readonly textPlusValue = signal('');
  readonly activeCell = signal<{ row: number; item: number } | null>(null);

  readonly rows = signal<TaskRow[]>([
    { select: 'hacer', header: 'casa' },
    { select: 'hacer', header: 'compu' },
    { select: 'hacer', header: 'citas,eventos' },
    { select: 'hacer', header: 'batallas' },
    { select: 'hacer', header: 'investigar' },
    { select: 'aprender', header: 'arte' },
    { select: 'aprender', header: 'Tecnologia' },
    { select: 'aprender', header: 'Cultura' },
    { select: 'aprender', header: 'Sanacion' },
    { select: 'aprender', header: 'Espiritualidad' },
    { select: 'comprar', header: 'Herramientas' },
    { select: 'comprar', header: 'Electrodomesticos' },
    { select: 'comprar', header: 'HigienePersonal' },
    { select: 'comprar', header: 'Gustos' },
    { select: 'comprar', header: 'Otros' },
    { select: 'Logros', header: 'cuerpo' },
    { select: 'Logros', header: 'mision' },
    { select: 'Logros', header: 'espiritu' },
    { select: 'Logros', header: 'alma' },
    { select: 'Logros', header: 'mental' },
    { select: 'amenazas', header: 'deudas' },
    { select: 'amenazas', header: 'enfermedades' },
    { select: 'amenazas', header: 'gastos' },
    { select: 'amenazas', header: 'imprevistos' },
    { select: 'amenazas', header: 'otros' },
  ]);

  readonly itemValues = signal<Record<number, string[]>>(this.loadItems());
  readonly csv = signal('');
  readonly isAdding = signal(false);
  readonly addHeaderIndex = signal(0);
  readonly newItem = signal('');
  readonly selectOptions = ['hacer', 'aprender', 'comprar', 'Logros', 'amenazas'];
  readonly selectedCategory = signal(this.selectOptions[0]);

  get visibleRows(): Array<TaskRow & { index: number }> {
    return this.rows()
      .map((row, index) => ({ ...row, index }))
      .filter((row) => row.select === this.selectedCategory());
  }

  selectCategory(event: Event): void {
    this.selectedCategory.set((event.target as HTMLSelectElement).value);
    this.refreshCsv();
  }

  addItem(): void {
    this.isAdding.set(true);
    this.newItem.set('');
  }

  cancelAddItem(): void {
    this.isAdding.set(false);
  }

  saveNewItem(): void {
    const item = this.newItem().trim();
    const column = this.visibleRows[this.addHeaderIndex()];
    if (!item || !column) return;

    const current = this.itemValues()[column.index] ?? [];
    const values = { ...this.itemValues(), [column.index]: [...current, item] };
    this.itemValues.set(values);
    localStorage.setItem('calevradmin-tareas-items', JSON.stringify(values));
    this.refreshCsv();
    this.isAdding.set(false);
  }

  toggleEditing(): void {
    this.isEditing.update((value) => !value);
  }

  updateRow(event: Event, index: number, field: keyof TaskRow): void {
    const value = (event.target as HTMLInputElement).value;
    this.rows.update((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
    this.refreshCsv();
  }

  updateItem(event: Event, row: number, item: number): void {
    const value = (event.target as HTMLInputElement).value;
    this.itemValues.update((values) => {
      const items = [...(values[row] ?? [])];
      items[item] = value;
      return { ...values, [row]: items };
    });
    localStorage.setItem('calevradmin-tareas-items', JSON.stringify(this.itemValues()));
    this.refreshCsv();
  }

  deleteItem(row: number, item: number): void {
    this.itemValues.update((values) => {
      const items = [...(values[row] ?? [])];
      items.splice(item, 1);
      return { ...values, [row]: items };
    });
    localStorage.setItem('calevradmin-tareas-items', JSON.stringify(this.itemValues()));
    this.refreshCsv();
  }

  openTextPlus(row: number, item: number): void {
    this.activeCell.set({ row, item });
    this.textPlusValue.set(this.textValue(row, item));
  }

  saveTextPlus(): void {
    const cell = this.activeCell();
    if (cell === null) return;
    const textValues = this.loadTextValues();
    textValues[`${cell.row}:${cell.item}`] = this.textPlusValue();
    localStorage.setItem('calevradmin-tareas-text', JSON.stringify(textValues));
    this.refreshCsv();
    this.activeCell.set(null);
  }

  private refreshCsv(): void {
    const values = this.itemValues();
    const csvRows = this.rows().flatMap((row, rowIndex) =>
      (values[rowIndex] ?? []).map((item, itemIndex) =>
        `${this.escapeCsv(row.header)},${this.escapeCsv(item)},${this.escapeCsv(this.textValue(rowIndex, itemIndex))}`,
      ),
    );
    const csv = ['Header,Item,Valor', ...csvRows].join('\r\n');
    this.csv.set(csv);
    try {
      localStorage.setItem('calevradmin-tareas.csv', csv);
    } catch {
      // La tabla sigue funcionando aunque el almacenamiento no esté disponible.
    }
  }

  private textValue(row: number, item: number): string {
    return this.loadTextValues()[`${row}:${item}`] ?? '';
  }

  private escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private loadItems(): Record<number, string[]> {
    try {
      const values = JSON.parse(localStorage.getItem('calevradmin-tareas-items') ?? '{}') as Record<number, string | string[]>;
      return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, Array.isArray(value) ? value : [value]]));
    } catch {
      return {};
    }
  }

  private loadTextValues(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem('calevradmin-tareas-text') ?? '{}') as Record<string, string>;
    } catch {
      return {};
    }
  }
}
