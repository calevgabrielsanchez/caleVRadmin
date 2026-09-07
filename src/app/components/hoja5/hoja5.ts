import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faCheck, faPen } from '@fortawesome/free-solid-svg-icons';
import { TextPlusComponent } from '../text-plus.component/text-plus.component';

@Component({
  selector: 'app-hoja5',
  standalone: true,
  imports: [FontAwesomeModule, TextPlusComponent],
  templateUrl: './hoja5.html',
  styleUrl: './hoja5.css',
})
export class Hoja5Component {
  readonly faChevronDown = faChevronDown;
  readonly faCheck = faCheck;
  readonly faPen = faPen;
  readonly isEditing = signal(false);
  readonly textPlusValue = signal('');
  readonly textPlusCell = signal<{ section: string; row: number; column: number } | null>(null);
  readonly options = ['Mision', 'Mente', 'Cuerpo', 'Espiritu', 'Alma'];
  readonly selectedOption = signal(this.options[0]);

  readonly headers: Record<string, string[]> = {
    Mision: ['Calevrijez', 'DigitalSolution', 'Cefoarte', '52Hz', 'KVU'],
    Mente: ['Memoria', 'Solución', 'Sapiencia', 'Creatividad', 'Descanso'],
    Cuerpo: ['Fuerza', 'Elasticidad', 'Resistencia', 'Aguilidad', 'Tecnicas'],
    Espiritu: ['Interactuar', 'Conciencia', 'Hábitos', 'Apariencia', 'Recompensas'],
    Alma: ['Enfermedades', 'Traumas', 'Medicinas', 'Karma', 'Batallas'],
  };

  readonly rows = signal<Record<string, string[][]>>({
    Mision: [
      ['FaceSawap', 'web', 'presenciales', 'CaleVrijez', 'music'],
      ['Calaveras', 'redes', 'online', 'KVU', 'Calivroz'],
      ['RaresaS', 'IA', 'plataformas', 'nivellula', 'inventos'],
      ['Cuadros', 'AR', 'diplomados', 'comidaV', 'promocion'],
      ['Personalizados', 'Apps', 'talleres', 'presentaciones', 'productions'],
    ],
    Mente: [['item0', 'item1', 'item2', 'item3', 'item4']],
    Cuerpo: [['item0', 'item1', 'item2', 'item3', 'item4']],
    Espiritu: [['item0', 'item1', 'item2', 'item3', 'item4']],
    Alma: [['item0', 'item1', 'item2', 'item3', 'item4']],
  });

  readonly textValues = signal<Record<string, string>>(this.loadTextValues());

  readonly csv = signal(this.buildCsv());

  selectOption(event: Event): void {
    this.selectedOption.set((event.target as HTMLSelectElement).value);
    this.refreshCsv();
  }

  toggleEditing(): void {
    this.isEditing.update((editing) => !editing);
  }

  updateHeader(event: Event, index: number): void {
    this.headers[this.selectedOption()][index] = (event.target as HTMLInputElement).value;
    this.refreshCsv();
  }

  updateCell(event: Event, rowIndex: number, columnIndex: number): void {
    const value = (event.target as HTMLInputElement).value;
    this.rows.update((tables) => {
      const table = tables[this.selectedOption()].map((row) => [...row]);
      table[rowIndex][columnIndex] = value;
      return { ...tables, [this.selectedOption()]: table };
    });
    this.refreshCsv();
  }

  openTextPlus(rowIndex: number, columnIndex: number): void {
    const section = this.selectedOption();
    const key = this.cellKey(section, rowIndex, columnIndex);
    this.textPlusCell.set({ section, row: rowIndex, column: columnIndex });
    this.textPlusValue.set(this.textValues()[key] ?? '');
  }

  closeTextPlus(): void {
    this.textPlusCell.set(null);
  }

  saveTextPlus(): void {
    const cell = this.textPlusCell();
    if (!cell) {
      return;
    }
    const key = this.cellKey(cell.section, cell.row, cell.column);
    const values = { ...this.textValues(), [key]: this.textPlusValue() };
    this.textValues.set(values);
    this.saveTextValues(values);
    this.refreshCsv();
    this.closeTextPlus();
  }

  private refreshCsv(): void {
    this.csv.set(this.buildCsv());
  }

  private buildCsv(): string {
    const section = this.selectedOption();
    const table = this.rows()[section];
    const values = this.textValues();
    const rows = table.flatMap((row, rowIndex) => row.map((item, columnIndex) => {
      const key = this.cellKey(section, rowIndex, columnIndex);
      return `${this.escapeCsv(item)},${this.escapeCsv(values[key] ?? '')}`;
    }));
    return ['Item,Valor', ...rows].join('\r\n');
  }

  private escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private cellKey(section: string, row: number, column: number): string {
    return `${section}:${row}:${column}`;
  }

  private loadTextValues(): Record<string, string> {
    try {
      const stored = localStorage.getItem('calevradmin-hoja5-text-values');
      return stored ? JSON.parse(stored) as Record<string, string> : {};
    } catch {
      return {};
    }
  }

  private saveTextValues(values: Record<string, string>): void {
    try {
      localStorage.setItem('calevradmin-hoja5-text-values', JSON.stringify(values));
    } catch {
      // El contenido sigue disponible durante la sesión aunque el almacenamiento no esté disponible.
    }
  }
}
