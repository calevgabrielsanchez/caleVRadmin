import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { faCalendarDays, faChevronDown, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

interface AgendaEvent { id: string; date: string; title: string; description: string; }

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class AgendaComponent {
  readonly faCalendarDays = faCalendarDays;
  readonly faChevronDown = faChevronDown;
  readonly faPlus = faPlus;
  readonly faPen = faPen;
  readonly faTrash = faTrash;
  readonly filters = ['Todas', 'Mes', 'Semana'];
  readonly filter = signal('Todas');
  readonly referenceDate = signal(new Date().toISOString().slice(0, 10));
  readonly events = signal<AgendaEvent[]>(this.loadEvents());
  readonly isAdding = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly title = signal('');
  readonly description = signal('');
  @ViewChild('agendaDate') agendaDate?: ElementRef<HTMLInputElement>;

  readonly visibleEvents = computed(() => {
    if (this.filter() === 'Todas') return this.events();
    return this.events().filter((event) => this.filter() === 'Mes'
      ? event.date.slice(0, 7) === this.referenceDate().slice(0, 7)
      : this.sameWeek(event.date));
  });

  setFilter(event: Event): void { this.filter.set((event.target as HTMLSelectElement).value); }
  setDate(event: Event): void { this.referenceDate.set((event.target as HTMLInputElement).value); }
  openDatePicker(): void { this.agendaDate?.nativeElement.showPicker?.(); this.agendaDate?.nativeElement.focus(); }

  openForm(): void { this.editingId.set(null); this.title.set(''); this.description.set(''); this.isAdding.set(true); }
  edit(event: AgendaEvent): void { this.editingId.set(event.id); this.title.set(event.title); this.description.set(event.description); this.isAdding.set(true); }
  cancel(): void { this.isAdding.set(false); this.editingId.set(null); }

  save(): void {
    const title = this.title().trim();
    if (!title) return;
    const id = this.editingId();
    const events = id
      ? this.events().map((event) => event.id === id ? { ...event, title, description: this.description() } : event)
      : [...this.events(), { id: `${Date.now()}`, date: this.referenceDate(), title, description: this.description() }];
    this.events.set(events); this.persist(events); this.cancel();
  }

  remove(id: string): void { const events = this.events().filter((event) => event.id !== id); this.events.set(events); this.persist(events); }
  prepareGoogleSync(): void { window.alert('La sincronización con Google Calendar requiere configurar OAuth.'); }

  private sameWeek(value: string): boolean {
    const date = new Date(`${value}T00:00:00`);
    const reference = new Date(`${this.referenceDate()}T00:00:00`);
    const day = (reference.getDay() + 6) % 7;
    const start = new Date(reference); start.setDate(reference.getDate() - day); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(start.getDate() + 7);
    return date >= start && date < end;
  }

  private loadEvents(): AgendaEvent[] { try { return JSON.parse(localStorage.getItem('calevradmin-agenda') ?? '[]') as AgendaEvent[]; } catch { return []; } }
  private persist(events: AgendaEvent[]): void { localStorage.setItem('calevradmin-agenda', JSON.stringify(events)); }
}
