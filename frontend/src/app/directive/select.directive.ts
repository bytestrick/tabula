import {AfterViewInit, Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges} from '@angular/core';

@Directive({
  selector: '[appSelect]',
  standalone: true
})
export class SelectDirective implements OnChanges, AfterViewInit {

  @Input('appIsSelected') isSelected: boolean = false;
  @Input('appTargetOfSelection') targetElement?: HTMLElement;


  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}


  ngAfterViewInit(): void {
    this.updateSelection();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isSelected']) {
      this.updateSelection();
    }
  }


  private updateSelection(): void {
    const element: HTMLElement = this.targetElement || this.elementRef.nativeElement;

    if (this.isSelected)
      this.renderer.setStyle(element, 'background', 'lightblue');
    else
      this.renderer.removeStyle(element, 'background');
  }
}
