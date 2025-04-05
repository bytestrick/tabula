import {AfterViewInit, Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges} from '@angular/core';

@Directive({
  selector: '[appSelect]',
  standalone: true
})
export class SelectDirective implements OnChanges, AfterViewInit {

  @Input('appIsSelected') isSelected: boolean = false;
  @Input() selectedNeighbors: { top: boolean, bottom: boolean, left: boolean, right: boolean } = { top: false, bottom: false, left: false, right: false };
  @Input('appTargetOfSelection') targetElement?: HTMLElement;


  private borderStyle: string = '1px solid var(--bs-primary)';

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    this.updateSelection();
  }


  ngOnChanges(_changes: SimpleChanges): void {
    this.updateSelection();
  }


  private updateSelection(): void {
    const element: HTMLElement = this.targetElement || this.elementRef.nativeElement;

    if (this.isSelected) {
      this.renderer.setStyle(element, 'background', 'var(--selection-bg)');
      this.renderer.setStyle(element, 'border', this.borderStyle);

      if (this.selectedNeighbors.right)
        this.renderer.removeStyle(element, 'border-right');

      if (this.selectedNeighbors.bottom)
        this.renderer.removeStyle(element, 'border-bottom');

      if (this.selectedNeighbors.top)
        this.renderer.removeStyle(element, 'border-top');

      if (this.selectedNeighbors.left)
        this.renderer.removeStyle(element, 'border-left');
    }
    else {
      this.renderer.removeStyle(element, 'background');
      this.renderer.removeStyle(element, 'border');
    }
  }
}
