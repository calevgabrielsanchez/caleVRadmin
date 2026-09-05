import { Component, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface Hoja5Row {
  head1: string;
  head2: string;
  head3: string;
  head4: string;
  head5: string;
}

@Component({
  selector: 'app-hoja5',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './hoja5.html',
  styleUrl: './hoja5.css',
})
export class Hoja5Component {
  readonly faChevronDown = faChevronDown;
  readonly options = ['Mision', 'Mente', 'Cuerpo', 'Espiritu', 'Alma'];
  readonly selectedOption = signal(this.options[0]);

  readonly headers: Record<string, string[]> = {
    Mision: ['Calevrijez', 'DigitalSolution', 'Cefoarte', '52Hz', 'KVU'],
    Mente: ['Memoria', 'Solución', 'Sapiencia', 'Creatividad', 'Descanso'],
    Cuerpo: ['Fuerza', 'Elasticidad', 'Resistencia', 'Aguilidad', 'Tecnicas'],
    Espiritu: ['Interactuar', 'Conciencia', 'Hábitos', 'Apariencia', 'Recompensas'],
    Alma: ['Enfermedades', 'Traumas', 'Medicinas', 'Karma', 'Batallas'],
  };

  readonly rows: Record<string, Hoja5Row[]> = {
    Mision: [{ head1: 'item0', head2: 'item1', head3: 'item2', head4: 'item3', head5: 'item4' }],
    Mente: [{ head1: 'item0', head2: 'item1', head3: 'item2', head4: 'item3', head5: 'item4' }],
    Cuerpo: [{ head1: 'item0', head2: 'item1', head3: 'item2', head4: 'item3', head5: 'item4' }],
    Espiritu: [{ head1: 'item0', head2: 'item1', head3: 'item2', head4: 'item3', head5: 'item4' }],
    Alma: [{ head1: 'item0', head2: 'item1', head3: 'item2', head4: 'item3', head5: 'item4' }],
  };

  selectOption(event: Event): void {
    this.selectedOption.set((event.target as HTMLSelectElement).value);
  }
}
