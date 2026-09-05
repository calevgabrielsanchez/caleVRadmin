import { Component, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBookOpen,
  faCalendarDays,
  faClock,
  faHandHoldingHeart,
  faListCheck,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  readonly sections = [
    { label: 'Hoja 5', icon: faBookOpen },
    { label: 'Tareas', icon: faListCheck },
    { label: 'Diario', icon: faBookOpen },
    { label: 'Sanación', icon: faHandHoldingHeart },
    { label: 'Personas', icon: faUsers },
    { label: 'Agenda', icon: faCalendarDays },
    { label: 'Horario', icon: faClock },
  ];

  readonly selectedSection = signal('Hoja 5');
  readonly sectionSelected = output<string>();
  readonly tooltipSection = signal<string | null>(null);
  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  selectSection(label: string): void {
    this.selectedSection.set(label);
    this.sectionSelected.emit(label);
  }

  startTooltip(label: string): void {
    this.clearTooltipTimer();
    this.tooltipTimer = setTimeout(() => this.tooltipSection.set(label), 500);
  }

  stopTooltip(): void {
    this.clearTooltipTimer();
    this.tooltipSection.set(null);
  }

  private clearTooltipTimer(): void {
    if (this.tooltipTimer !== null) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
  }
}
