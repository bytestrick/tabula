import {Directive, ElementRef, HostListener, Input, OnChanges, Renderer2, SimpleChanges} from '@angular/core';

@Directive({
  selector: '[appHighlightBorders]',
  standalone: true
})
export class HighlightBordersDirective implements OnChanges {

  @Input('appHighlightBordersOf') targetElement!: HTMLElement;
  @Input() canDisable: boolean = true;

  isHovered = false;


  constructor(private el: ElementRef, private renderer: Renderer2) {}


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
    const element: HTMLElement = this.targetElement || this.el.nativeElement;
    this.renderer.setStyle(element, 'border', 'solid 1px lightblue');
  }


  private removeHighlight(): void {
    const element: HTMLElement = this.targetElement || this.el.nativeElement;
    this.renderer.removeStyle(element, 'border');
  }
}
