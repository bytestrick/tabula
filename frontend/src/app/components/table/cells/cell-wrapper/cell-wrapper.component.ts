import {
  AfterViewInit,
  Component,
  ComponentRef,
  Input,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {BaseCellComponent} from '../base-cell-component';

@Component({
  selector: 'app-cell-wrapper',
  standalone: true,
  imports: [],
  template: `
    <div [style]="highlight" (mouseenter)="onMouseEnter()" (mouseleave)="onMouseLeave()">
      <ng-container #container></ng-container>
    </div>`,
  styles: [`
    div {
      height: 52px;
      overflow: auto;
      display: flex;
      align-items: center;
    }
  `]
})
export class CellWrapperComponent implements AfterViewInit {

  @Input() cellType: Type<BaseCellComponent> | null = null;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  protected highlight: string = 'none';

  cellRef: ComponentRef<BaseCellComponent> | null = null;


  ngAfterViewInit(): void {
    if (this.cellType === null)
      return;

    this.cellRef = this.container.createComponent(this.cellType);
  }


  onMouseEnter(): void {
    this.highlight = 'border: solid 1px lightblue';
  }


  onMouseLeave(): void {
    this.highlight = 'border: none';
  }
}

