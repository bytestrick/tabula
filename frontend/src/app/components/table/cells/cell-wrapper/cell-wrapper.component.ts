import {
  AfterViewInit,
  Component,
  ComponentRef, ElementRef,
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
    <div #borders>
      <ng-container #container></ng-container>
    </div>`,
  styles: [`
    div {
      height: 52px;
      overflow: auto;
      display: flex;
      align-items: center;
      padding: 4px;
    }
  `]
})
export class CellWrapperComponent implements AfterViewInit {

  @Input() cellType: Type<BaseCellComponent> | null = null;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild('borders', { static: true }) borders!: ElementRef;

  cellRef: ComponentRef<BaseCellComponent> | null = null;


  ngAfterViewInit(): void {
    if (this.cellType === null)
      return;

    this.cellRef = this.container.createComponent(this.cellType);
  }
}

