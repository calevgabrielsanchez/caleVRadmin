import { Component } from '@angular/core';
import { signal } from '@angular/core';
import { TextPlusComponent } from '../text-plus.component/text-plus.component';

@Component({
  selector: 'app-horario',
  standalone: true,
  imports: [TextPlusComponent],
  templateUrl: './horario.html',
  styleUrl: './horario.css',
})
export class HorarioComponent {
  readonly activeActivity = signal<string | null>(null);
  readonly textPlusValue = signal('');

  openActivity(id: string): void {
    this.activeActivity.set(id);
    this.textPlusValue.set(this.loadValues()[id] ?? '');
  }

  saveActivity(): void {
    const id = this.activeActivity();
    if (!id) return;
    const values = { ...this.loadValues(), [id]: this.textPlusValue() };
    localStorage.setItem('calevradmin-horario-text', JSON.stringify(values));
    const csv = Object.entries(values).map(([activity, value]) =>
      `"${activity.replace(/"/g, '""')}","${value.replace(/"/g, '""')}"`,
    );
    localStorage.setItem('calevradmin-horario.csv', ['Actividad,Valor', ...csv].join('\r\n'));
    this.activeActivity.set(null);
  }

  private loadValues(): Record<string, string> {
    try { return JSON.parse(localStorage.getItem('calevradmin-horario-text') ?? '{}') as Record<string, string>; }
    catch { return {}; }
  }
}
