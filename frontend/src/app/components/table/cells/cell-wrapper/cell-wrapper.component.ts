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
    <div [style]="highlight" (mouseenter)="onMouseEnter()" (mouseout)="onMouseOut()">
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

  cellRef: ComponentRef<BaseCellComponent> | null = null;
  highlight: string = 'none';


  ngAfterViewInit(): void {
    if (this.cellType === null)
      return;

    this.cellRef = this.container.createComponent(this.cellType);
  }


  onMouseEnter(): void {
    this.highlight = 'border: solid 1px lightblue';
  }


  onMouseOut(): void {
    this.highlight = 'border: none';
  }
}

