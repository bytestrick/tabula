import {AfterViewInit, Directive, HostListener, Input, OnInit, Renderer2} from '@angular/core';

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
  private lastCol: HTMLElement | null = null;



  constructor(private renderer: Renderer2) {}



  ngAfterViewInit(): void {
    this.body = document.body;
    this.lastCol = this.colgroup.children[this.colgroup.children.length] as HTMLElement;
  }


  ngOnInit(): void {
    this.colElement = this.colgroup.querySelector(`col[data-index="${this.colIndex}"]`);
  }


  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.classList.contains('resize-handle-active-area') && this.colElement) {
      this.dragging = true;
      this.colElement.setAttribute('data-resized', '');

      if (this.body !== null)
        this.renderer.addClass(this.body, 'dragging-cursor');

      this.startX = event.clientX;
      this.startWidth = this.colElement.getBoundingClientRect().width;
      event.preventDefault();
    } else {
      event.stopPropagation();
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

    if (this.lastCol !== null && this.lastCol.offsetWidth < parseInt(window.getComputedStyle(this.lastCol).minWidth, 0))
      this.renderer.setStyle(this.lastCol, 'width', "var(--cell-table-min-width)");
  }


  @HostListener('document:mouseup', ['$event'])
  onMouseUp(): void {
    this.dragging = false;

    if (this.body !== null) {
      this.renderer.removeClass(this.body, 'dragging-cursor');
    }
  }
}
