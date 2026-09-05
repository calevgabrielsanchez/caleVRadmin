import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faFolderOpen, faDragon, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Menu } from "../menu/menu";
import { Reproductor } from "../reproductor/reproductor";
import { Hoja5Component } from "../hoja5/hoja5";
import type { BrowserEntry } from "../../services/file-browser.service";

@Component({
  imports: [CommonModule, FontAwesomeModule, Menu, Reproductor, Hoja5Component],
  selector: 'app-main',
  styleUrl: './main.css',
  templateUrl: './main.html',
})
export class Main {
  readonly activeSection = signal('Hoja 5');

  faBars = faBars;
  faFolderOpen = faFolderOpen;
  faDragon = faDragon;
  faGlobe = faGlobe;

  // Modos del botA3n de perfil (ciclo al hacer clic)
  profileModes = [
    { id: 'archivos', icon: faFolderOpen, label: 'Archivos' },
    { id: 'calevrije', icon: faDragon, label: 'CaleVRije' },
    { id: 'universo', icon: faGlobe, label: 'Universo' },
  ];
  profileIndex = signal(0);

  get profileIcon() {
    return this.profileModes[this.profileIndex()].icon;
  }

  getProfileLabel(): string {
    return this.profileModes[this.profileIndex()].label;
  }

  cycleProfile(): void {
    this.profileIndex.set((this.profileIndex() + 1) % this.profileModes.length);
  }

  onSectionSelected(section: string): void {
    this.activeSection.set(section);
  }

  // Ruta de la carpeta seleccionada
  selectedPath: string = '';

  // Estado para controlar si el menA- estA- visible o no
  isMenuOpen: boolean = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onFolderSelected(path: string): void {
    this.selectedPath = path;
  }

  readonly mediaEntry = signal<BrowserEntry | null>(null);

  onOpenMedia(entry: BrowserEntry): void {
    this.mediaEntry.set(entry);
  }

  onCloseMedia(): void {
    this.mediaEntry.set(null);
  }

  onMediaRenamed(event: { oldPath: string; newPath: string; newName: string }): void {
    const current = this.mediaEntry();
    if (current && current.path === event.oldPath) {
      this.mediaEntry.set({ ...current, name: event.newName, path: event.newPath });
    }
  }
}
