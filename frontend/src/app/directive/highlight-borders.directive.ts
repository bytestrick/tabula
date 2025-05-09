import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[tblHighlightBorders]',
  standalone: true
})
export class HighlightBordersDirective implements OnChanges, AfterViewInit {

  @Input('tblHighlightBordersOf') targetElement?: HTMLElement;
  @Input('tblHighlightCanDisable') canDisable: boolean = true;

  private borderStyle: string = '2px dashed';
  private borderColor: string = 'var(--bs-primary)';

  private isHovered: boolean = false;


  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    const element: HTMLElement = this.targetElement || this.elementRef.nativeElement;

    this.renderer.setStyle(element, 'outline', this.borderStyle);
    this.renderer.setStyle(element, 'outline-offset', 'calc(var(--cell-table-margin) - 1px)');
    this.renderer.setStyle(element, 'outline-color', 'transparent');
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canDisable']) {
      if (this.canDisable && !this.isHovered) {
        this.removeHighlight();
      }
    }
  }


  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.isHovered = true;
    this.applyHighlight();
  }


  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.isHovered = false;
    if (this.canDisable) {
      this.removeHighlight();
    }
  }


  private applyHighlight(): void {
    const element: HTMLElement = this.targetElement || this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'outline-color', this.borderColor);
  }


  private removeHighlight(): void {
    const element: HTMLElement = this.targetElement || this.elementRef.nativeElement;
    this.renderer.setStyle(element, 'outline-color', 'transparent');
  }
}
