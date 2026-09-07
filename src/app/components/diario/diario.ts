import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendarDays, faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TextPlusComponent } from '../text-plus.component/text-plus.component';

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
}

@Component({
  selector: 'app-diario',
  standalone: true,
  imports: [FontAwesomeModule, TextPlusComponent],
  templateUrl: './diario.html',
  styleUrl: './diario.css',
})
export class DiarioComponent {
  readonly faCalendarDays = faCalendarDays;
  readonly faPlus = faPlus;
  readonly faPen = faPen;
  readonly faTrash = faTrash;
  readonly currentDate = signal(this.formatDate(new Date()));
  readonly activeDate = signal<string | null>(null);
  readonly tooltipEntry = signal<string | null>(null);
  readonly textPlusValue = signal('');
  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;
  @ViewChild('datePicker') datePicker?: ElementRef<HTMLInputElement>;
  readonly savedEntries = signal<DiaryEntry[]>(this.loadEntries());

  addCurrentDate(): void {
    const date = this.currentDate();
    const title = window.prompt('Título del diario:', `Fecha guardada ${date}`)?.trim();
    if (!title) {
      return;
    }
    this.savedEntries.update((entries) => [...entries, { id: `${Date.now()}`, date, title }]);
    this.persistEntries();
    this.refreshCsv();
  }

  openTextPlus(id: string): void {
    this.activeDate.set(id);
    this.textPlusValue.set(this.loadDiaryTexts()[id] ?? '');
  }

  saveTextPlus(): void {
    const id = this.activeDate();
    if (!id) return;
    const values = { ...this.loadDiaryTexts(), [id]: this.textPlusValue() };
    localStorage.setItem('calevradmin-diario-text', JSON.stringify(values));
    this.refreshCsv();
    this.activeDate.set(null);
  }

  editEntry(id: string): void {
    this.openTextPlus(id);
  }

  deleteEntry(id: string): void {
    this.savedEntries.update((entries) => entries.filter((entry) => entry.id !== id));
    const values = this.loadDiaryTexts();
    delete values[id];
    localStorage.setItem('calevradmin-diario-text', JSON.stringify(values));
    this.persistEntries();
    this.refreshCsv();
  }

  private persistEntries(): void {
    localStorage.setItem('calevradmin-diario-entries', JSON.stringify(this.savedEntries()));
  }

  private refreshCsv(): void {
    const texts = this.loadDiaryTexts();
    const rows = this.savedEntries().map((entry) => [
      this.escapeCsv(entry.title),
      this.escapeCsv(entry.date),
      this.escapeCsv(texts[entry.id] ?? ''),
    ].join(','));
    localStorage.setItem('calevradmin-diario.csv', ['Titulo,Fecha,Valor', ...rows].join('\r\n'));
  }

  private escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private loadEntries(): DiaryEntry[] {
    try {
      return JSON.parse(localStorage.getItem('calevradmin-diario-entries') ?? '[]') as DiaryEntry[];
    } catch {
      return [];
    }
  }

  startTooltip(id: string): void {
    this.clearTooltipTimer();
    this.tooltipTimer = setTimeout(() => this.tooltipEntry.set(id), 500);
  }

  stopTooltip(): void {
    this.clearTooltipTimer();
    this.tooltipEntry.set(null);
  }

  private clearTooltipTimer(): void {
    if (this.tooltipTimer !== null) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
  }

  private loadDiaryTexts(): Record<string, string> {
    try {
      return JSON.parse(localStorage.getItem('calevradmin-diario-text') ?? '{}') as Record<string, string>;
    } catch {
      return {};
    }
  }

  openDatePicker(): void {
    this.datePicker?.nativeElement.showPicker?.();
    this.datePicker?.nativeElement.focus();
  }

  updateDate(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      this.currentDate.set(this.formatDate(new Date(year, month - 1, day)));
    }
  }

  private formatDate(date: Date): string {
    const formatted = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date).replace(/ de (\d{4})$/, ' del $1');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
}
