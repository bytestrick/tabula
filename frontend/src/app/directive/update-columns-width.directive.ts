import {
  AfterViewInit,
  Directive,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appUpdateColumnsWidth]',
  standalone: true
})
export class UpdateColumnsWidthDirective implements AfterViewInit, OnDestroy {

  @Input() colgroup!: HTMLElement;

  private mutationObserver: MutationObserver | null = null;



  constructor(private renderer: Renderer2) {}



  ngOnDestroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }


  ngAfterViewInit(): void {
    this.updateColumnsWidths();

    if (this.colgroup) {
      this.mutationObserver = new MutationObserver((): void => {
        this.updateColumnsWidths();
      });

      this.mutationObserver.observe(this.colgroup, { childList: true });
    }
  }


  @HostListener('window:resize')
  onResize(): void {
    this.updateColumnsWidths();
  }


  private updateColumnsWidths(): void {
    const table: HTMLElement | null = this.colgroup.parentElement;

    if (!this.colgroup || !table) {
      return;
    }

    const cols: HTMLCollection = this.colgroup.children;
    const totalWidth: number = table.offsetWidth;

    if (cols.length >= 1) {
      for (let i: number = 1; i < cols.length; ++i) {
        const colElement = cols[i] as HTMLElement;

        if (colElement.hasAttribute('data-resized')) {
          continue;
        }

        let colWidth: number = Math.floor(totalWidth / cols.length);
        const minWidth: number = parseInt(window.getComputedStyle(colElement).minWidth) || 0;

        if (colWidth <= minWidth) {
          colWidth = minWidth;
        }

        this.renderer.setStyle(colElement, 'width', `${colWidth}px`);
      }
    }
  }
}
