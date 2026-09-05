import { Component, Output, EventEmitter, model, OnInit, HostListener, Input, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faScroll,
  faSquareCheck,
  faCode,
  faSquareXmark,
  faCircleQuestion
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-text-plus',
  imports: [FormsModule, FaIconComponent],
  templateUrl: './text-plus.component.html',
  styleUrl: './text-plus.component.css',
})
export class TextPlusComponent implements OnInit {
  faScroll = faScroll;
  faSquareCheck = faSquareCheck;
  faCode = faCode;
  faSquareXmark = faSquareXmark;
  faCircleQuestion = faCircleQuestion;

  @Input() bloqueaBackspace = true;

  textoContenido = model<string>('');
  textoArea = '';
  vistaPergamino = '';
  code = true;

  @Output() cerrar = new EventEmitter<void>();
  @Output() aceptar = new EventEmitter<void>();

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.bloqueaBackspace) {
      return;
    }

    const target = event.target as HTMLElement | null;
    const insideEditor = !!target && this.elementRef.nativeElement.contains(target);
    const editable = !!target && (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.isContentEditable
    );

    if (
      event.key === 'Backspace' &&
      insideEditor &&
      !editable &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  ngOnInit(): void {
    this.textoArea = this.textoContenido() ?? '';
    this.actualizarVistaPergamino();
  }

  guardarYAceptar() {
    this.textoContenido.set(this.textoArea);
    this.aceptar.emit();
  }

  private escaparHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private renderTextoInline(texto: string): string {
    let html = this.escaparHtml(texto);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="destacado-verde">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<span class="destacado-azul">$1</span>');
    return html;
  }

  private renderDirWindow(titulo: string, contenido: string): string {
    return `
      <div class="dir-window">
        <div class="dir-title">${titulo}</div>
        <div class="dir-body">${contenido}</div>
      </div>
    `;
  }

  private renderTabla(contenido: string, opciones: string[]): string {
    const opcionesSet = new Set(opciones.map(o => o.trim().toLowerCase()));
    const resaltarHead = opcionesSet.has('head');
    const resaltarRow = opcionesSet.has('row');

    const lineas = contenido.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    if (lineas.length === 0) {
      return '';
    }

    const filas = lineas.map(linea => this.lineaACeldas(linea));

    const maxCols = filas.reduce((max, fila) => Math.max(max, fila.length), 0);

    const filasNormalizadas = filas.map(fila =>
      Array.from({ length: maxCols }, (_, i) => fila[i] ?? '')
    );

    return this.tablaHTML(filasNormalizadas, resaltarHead, resaltarRow);
  }

  private lineaACeldas(linea: string): string[] {
    const celdas: string[] = [];
    let actual = '';
    let inQuotes = false;

    for (let i = 0; i < linea.length; i++) {
      const char = linea[i];

      if (char === '"') {
        if (inQuotes && linea[i + 1] === '"') {
          actual += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        celdas.push(actual.trim());
        actual = '';
        continue;
      }

      actual += char;
    }

    celdas.push(actual.trim());
    return celdas;
  }

  private tablaHTML(filas: string[][], resaltarHead: boolean, resaltarRow: boolean): string {
    if (filas.length === 0) {
      return '';
    }

    if (!resaltarHead && !resaltarRow) {
      const filasHtml = filas.map(fila =>
        `<tr>${fila.map(celda => `<td>${this.renderTextoInline(celda)}</td>`).join('')}</tr>`
      ).join('');

      return `<div class="tabla-csv"><table>${filasHtml}</table></div>`;
    }

    let html = '<div class="tabla-csv"><table>';

    if (resaltarHead) {
      const encabezado = filas[0] ?? [];
      html += '<thead><tr>';
      for (const celda of encabezado) {
        html += `<th class="head-tabla">${this.renderTextoInline(celda)}</th>`;
      }
      html += '</tr></thead>';
    }

    html += '<tbody>';
    const inicio = resaltarHead ? 1 : 0;

    for (let r = inicio; r < filas.length; r++) {
      html += '<tr>';
      for (let c = 0; c < filas[r].length; c++) {
        const esPrimeraCol = c === 0 && resaltarRow;
        const tag = esPrimeraCol ? 'th' : 'td';
        const clase = esPrimeraCol ? ' class="row-tabla"' : '';
        html += `<${tag}${clase}>${this.renderTextoInline(filas[r][c])}</${tag}>`;
      }
      html += '</tr>';
    }
    html += '</tbody>';

    html += '</table></div>';
    return html;
  }

  private renderLinea(linea: string): string {
    const limpio = linea.trim();
    if (!limpio) {
      return '<br />';
    }

    const primer = limpio.charAt(0);
    const segundo = limpio.charAt(1);
    const ultimo = limpio.charAt(limpio.length - 1);

    if (primer === '#') {
      const contenido = this.escaparHtml(limpio.slice(1));
      if (segundo === '#') {
        return `<em>${this.escaparHtml(limpio.slice(2))}</em><br />`;
      }
      if (segundo === '/') {
        const url = this.escaparHtml(limpio.slice(2));
        return `<br /><a href="${url}" target="_blank">${url}</a><br />`;
      }
      return `<b>${contenido}</b><br />`;
    }

    if (primer === '@' && segundo === '/') {
      let url = this.escaparHtml(limpio.slice(2).trim());
      url = url.replace(/^https?:\/\/https?:\/\//, 'https://');
      url = url.replace(/^http:\/\/https:\/\//, 'https://');
      url = url.replace(/^https:\/\/http:\/\//, 'http://');

      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }

      return `<a class="media-link" href="${url}" target="_blank" rel="noopener noreferrer"><div class="media-image"><img src="${url}" alt="Imagen" /></div></a>`;
    }

    if (primer === '(') {
      const tipo = segundo;
      const contenidoBase = this.escaparHtml(limpio.slice(2, ultimo === ')' ? -1 : undefined));
      const clases: Record<string, string> = {
        '#': 'red',
        '@': 'yellow',
        '!': 'green',
        '?': 'blue',
        '/': 'grey'
      };

      const clase = clases[tipo] ?? 'grey';
      return `<div class="${clase}">${contenidoBase}</div>`;
    }

    if (primer === '-') {
      return '';
    }

    return `${this.renderTextoInline(limpio)}<br />`;
  }

  actualizarVistaPergamino() {
    if (!this.textoArea || !this.textoArea.trim()) {
      this.vistaPergamino = '';
      return;
    }

    const lineas = this.textoArea.split(/\r?\n/);
    let html = '';
    let listaActual: { titulo: string; entradas: string[] } | null = null;

    let i = 0;

    while (i < lineas.length) {
      const linea = lineas[i];
      const limpio = linea.trim();

      if (!limpio) {
        i++;
        continue;
      }

      const primer = limpio.charAt(0);
      const segundo = limpio.charAt(1);
      const tercero = limpio.charAt(2);

      // Bloque de tabla: -/opciones: ... :
      if (primer === '-' && segundo === '/' && tercero !== '/' && limpio.indexOf(':') !== -1) {
        const apertura = limpio.slice(2);
        const idxDosPuntos = apertura.indexOf(':');
        const opcionesRaw = apertura.slice(0, idxDosPuntos).trim();
        const opciones = opcionesRaw ? opcionesRaw.split(',') : [];

        const bloques: string[] = [];
        let j = i + 1;
        let body = '';
        let abierto = false;

        while (j < lineas.length) {
          const tl = lineas[j].trim();
          if (tl === ':') {
            bloques.push(body);
            body = '';
            abierto = true;
            j++;
            break;
          }
          body += (body ? '\n' : '') + lineas[j];
          j++;
        }

        if (abierto) {
          if (listaActual) {
            html += this.renderDirWindow(listaActual.titulo, listaActual.entradas.join(''));
            listaActual = null;
          }
          html += this.renderTabla(bloques[0] ?? '', opciones);
          i = j;
          continue;
        }
      }

      if (primer === '-') {
        if (segundo === '-') {
          if (!listaActual) {
            listaActual = { titulo: 'Lista', entradas: [] };
          }
          listaActual.entradas.push(`<div class="dir-entry">${this.renderTextoInline(limpio.slice(2))}</div>`);
          i++;
          continue;
        }

        if (listaActual) {
          html += this.renderDirWindow(listaActual.titulo, listaActual.entradas.join(''));
          listaActual = null;
        }

        listaActual = {
          titulo: this.renderTextoInline(limpio.slice(1)),
          entradas: []
        };
        i++;
        continue;
      }

      if (listaActual) {
        html += this.renderDirWindow(listaActual.titulo, listaActual.entradas.join(''));
        listaActual = null;
      }

      html += this.renderLinea(linea);
      i++;
    }

    if (listaActual) {
      html += this.renderDirWindow(listaActual.titulo, listaActual.entradas.join(''));
    }

    this.vistaPergamino = html;
  }

  convertirPergamino() {
    this.code = true;
    this.actualizarVistaPergamino();
  }

  convertirCodigo() {
    this.code = false;
  }

  help:boolean = false;
  text_old:string = '';
  onHelp(){
    if(!this.help){
    this.text_old = this.textoArea;
    this.help = true;
    this.textoArea = `#Titulo 
##Sub titulo 
-Lista 
--Elemento 
--Elemento  
#/http://www.google.com  

(/Cita) 

(#Warning) 

(@Alert) 

(!Succes) 

(?default)

-/head,row:
head1,head2,head3,head3
row1,valorA1,valorA2,valorA3
row2,valorB1,valorB2,valorB3
row3,valorC1,valorC2,valorC3
row4,valorD1,valorD2,valorD3
:

Este es el codigo de un *inbestigar que* y asi poder funcionar como tod un break

@/https://www.maestrosdelweb.com/images/2009/08/crayones_png24.png`;
this.actualizarVistaPergamino();
    }else{
      this.textoArea = this.text_old;
      this.help = false;
    }
  }
}
