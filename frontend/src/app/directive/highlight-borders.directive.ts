import {Directive, ElementRef, HostListener, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[appHighlightBorders]',
  standalone: true
})
export class HighlightBordersDirective {

  @Input('appHighlightBordersOf') targetElement!: HTMLElement;
  @Input() canDisable: boolean = true;

  constructor(private el: ElementRef, private renderer: Renderer2) {}


  @HostListener('mouseenter')
  onMouseEnter(): void {
    const element: HTMLElement = this.targetElement || this.el.nativeElement;
    this.renderer.setStyle(element, 'border', 'solid 1px lightblue');
  }


  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (!this.canDisable)
      return;

    const element: HTMLElement = this.targetElement || this.el.nativeElement;
    this.renderer.removeStyle(element, 'border');
  }
}
