import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

interface Person {
  name: string;
  description: string;
  details: Record<string, string>;
}

@Component({
  selector: 'app-personas',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './personas.html',
  styleUrl: './personas.css',
})
export class PersonasComponent {
  readonly fields = [
    'Cumpleaños', 'Ubicación actual y origen', 'Proyectos recientes', 'Círculo Cercano',
    'Parejas', 'Familia', 'Mascotas', 'Salud', 'Problemas', 'Hobbies', 'Comida', 'Metas',
    'Último tema', 'Temas sensibles', 'Personalidad', 'PeriodoMes', 'Utilidad', 'Calificacion', 'Otros',
  ];
  readonly faChevronDown = faChevronDown;
  readonly faPlus = faPlus;
  readonly faPen = faPen;
  readonly faTrash = faTrash;
  readonly selectedName = signal('');
  readonly people = signal<Person[]>(this.loadPeople());
  readonly isAdding = signal(false);
  readonly editingName = signal<string | null>(null);
  readonly newName = signal('');
  readonly newDescription = signal('');
  readonly formDetails = signal<Record<string, string>>({});

  selectedPerson(): Person | undefined {
    return this.people().find((person) => person.name === this.selectedName());
  }

  selectPerson(event: Event): void {
    this.selectedName.set((event.target as HTMLSelectElement).value);
  }

  openForm(): void {
    this.editingName.set(null);
    this.newName.set('');
    this.newDescription.set('');
    this.formDetails.set({});
    this.isAdding.set(true);
  }

  cancelForm(): void {
    this.isAdding.set(false);
    this.editingName.set(null);
  }

  editPerson(): void {
    const person = this.selectedPerson();
    if (!person) return;
    this.editingName.set(person.name);
    this.newName.set(person.name);
    this.newDescription.set(person.description);
    this.formDetails.set({ ...person.details });
    this.isAdding.set(true);
  }

  savePerson(): void {
    const name = this.newName().trim();
    if (!name) return;
    const description = this.newDescription().trim();
    const details = this.formDetails();
    const editing = this.editingName();
    const people = editing
      ? this.people().map((person) => person.name === editing ? { name, description, details } : person)
      : [...this.people(), { name, description, details }];
    this.people.set(people);
    this.selectedName.set(name);
    this.persistPeople(people);
    this.refreshCsv(people);
    this.isAdding.set(false);
    this.editingName.set(null);
  }

  deletePerson(): void {
    const name = this.selectedName();
    if (!name) return;
    const people = this.people().filter((person) => person.name !== name);
    this.people.set(people);
    this.selectedName.set(people[0]?.name ?? '');
    this.persistPeople(people);
    this.refreshCsv(people);
  }

  private loadPeople(): Person[] {
    try {
      const people = JSON.parse(localStorage.getItem('calevradmin-personas') ?? '[]') as Person[];
      this.selectedName.set(people[0]?.name ?? '');
      return people.map((person) => ({ ...person, details: person.details ?? {} }));
    } catch {
      return [];
    }
  }

  updateDetail(field: string, event: Event): void {
    this.formDetails.update((details) => ({
      ...details,
      [field]: (event.target as HTMLInputElement).value,
    }));
  }

  private persistPeople(people: Person[]): void {
    localStorage.setItem('calevradmin-personas', JSON.stringify(people));
  }

  private refreshCsv(people: Person[]): void {
    const headers = ['Nombre', 'Descripción', ...this.fields];
    const rows = people.map((person) => [
      person.name,
      person.description,
      ...this.fields.map((field) => person.details[field] ?? ''),
    ].map((value) => `"${value.replace(/"/g, '""')}"`).join(','));
    localStorage.setItem('calevradmin-personas.csv', [headers.join(','), ...rows].join('\r\n'));
  }
}
