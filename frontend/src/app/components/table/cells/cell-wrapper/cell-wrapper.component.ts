import {AfterViewInit, Component, ComponentRef, Input, OnInit, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {BaseCellComponent} from '../base-cell-component';

@Component({
  selector: 'app-cell-wrapper',
  standalone: true,
  imports: [],
  template: `<div><ng-container #container></ng-container></div>`,
  styles: [`
    div {
      height: 32px;
      overflow: auto;
    }
  `]
})
export class CellWrapperComponent implements AfterViewInit {

  @Input() cellType: Type<BaseCellComponent> | null = null;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  public cellRef: ComponentRef<BaseCellComponent> | null = null;


  ngAfterViewInit() {
    if (this.cellType === null)
      return;

    this.cellRef = this.container.createComponent(this.cellType);
  }
}

