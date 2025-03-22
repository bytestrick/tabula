import {Directive, ElementRef} from '@angular/core';


@Directive()
export abstract class BaseCellComponent {

  protected value: any = null;


  constructor(private elementRef: ElementRef) {
  }


  setValue(value: any): void {
    this.value = value
  }


  getValue(): any {
    return this.value;
  }


  isInsideViewport(): boolean {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const windowHeight: number = (window.innerHeight || document.documentElement.clientHeight);
    const windowWidth: number = (window.innerWidth || document.documentElement.clientWidth);

    const verticallyVisible: boolean = rect.top < windowHeight && rect.bottom > 0;
    const horizontallyVisible: boolean = rect.left < windowWidth && rect.right > 0;
    return verticallyVisible && horizontallyVisible;
  }
}
