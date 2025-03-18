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
  selector: '[appHighlightBorders]',
  standalone: true
})
export class HighlightBordersDirective implements OnChanges, AfterViewInit {

  @Input('appHighlightBordersOf') targetElement!: HTMLElement;
  @Input() canDisable: boolean = true;

  private borderStyle: string = '2px dashed';
  private borderColor: string = 'var(--bs-primary)';

  isHovered: boolean = false;


  constructor(private el: ElementRef, private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    const element: HTMLElement = this.targetElement || this.el.nativeElement;

    this.renderer.setStyle(element, 'border', this.borderStyle);
    this.renderer.setStyle(element, 'border-color', 'transparent');
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
    const element: HTMLElement = this.targetElement || this.el.nativeElement;
    this.renderer.setStyle(element, 'border-color', this.borderColor);
  }


  private removeHighlight(): void {
    const element: HTMLElement = this.targetElement || this.el.nativeElement;
    this.renderer.setStyle(element, 'border-color', 'transparent');
  }
}
