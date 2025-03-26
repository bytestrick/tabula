import {AfterViewInit, Directive, HostListener, Input, OnInit, Renderer2, RendererStyleFlags2} from '@angular/core';

@Directive({
  selector: '[appResizableTableColumn]',
  standalone: true
})
export class ResizableTableColumnDirective implements OnInit, AfterViewInit {

  @Input() colIndex!: number;
  @Input() colgroup!: HTMLElement;

  private dragging: boolean = false;
  private startX: number = 0;
  private startWidth: number = 0;
  private colElement: HTMLElement | null = null;
  private body: HTMLElement | null = null;



  constructor(private renderer: Renderer2) {}



  ngAfterViewInit(): void {
    this.body = document.body;
  }


  ngOnInit(): void {
    this.colElement = this.colgroup.querySelector(`col[data-index="${this.colIndex}"]`);
  }


  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // Controlla se il resize-handle è stato cliccato.
    if ((event.target as HTMLElement).classList.contains('resize-handle') && this.colElement) {
      this.dragging = true;

      if (this.body !== null) {
        // Per evitare che l'icona del mouse sfarfalli cambiando icona velocemente quando il mouse esce dal
        // resize-handle durante il trascinamento.
        this.renderer.setStyle(this.body, 'cursor', 'var(--resize-column-cursor-style)', RendererStyleFlags2.Important);
      }

      this.startX = event.clientX;
      this.startWidth = this.colElement.getBoundingClientRect().width;
      event.preventDefault();
    }
  }


  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.dragging || !this.colElement) {
      return;
    }
    const dx: number = event.clientX - this.startX;
    let newWidth: number = this.startWidth + dx;

    const minWidth: number = parseInt(window.getComputedStyle(this.colElement).minWidth) || 0;

    if (newWidth < minWidth)
      newWidth = minWidth;

    this.renderer.setStyle(this.colElement, 'width', `${newWidth}px`);
  }


  @HostListener('document:mouseup', ['$event'])
  onMouseUp(): void {
    this.dragging = false;

    if (this.body !== null) {
      this.renderer.removeStyle(this.body, 'cursor');
    }
  }
}
