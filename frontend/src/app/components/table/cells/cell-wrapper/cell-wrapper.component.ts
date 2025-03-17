import {
  AfterViewInit,
  Component,
  ComponentRef, ElementRef,
  Input,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {BaseCellComponent} from '../base-cell-component';
import {DataType} from '../../../../model/data-type';
import {DataTypeCellComponent} from '../data-type-cell/data-type-cell.component';
import {Pair} from '../../../../model/pair';

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
      height: var(--cell-table-min-height);
      overflow-x: auto;
      overflow-y: hidden;
      display: flex;
      align-items: center;
      padding: var(--cell-table-padding);
    }
  `]
})
export class CellWrapperComponent implements AfterViewInit {

  @Input() cellDataType: DataType | null = null;
  @Input() iconDataType: Pair<DataType, DataType> | null = null;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild('borders', { static: true }) borders!: ElementRef;

  cellRef: ComponentRef<BaseCellComponent> | null = null;


  ngAfterViewInit(): void {
    if (this.cellDataType !== null)
      this.cellRef = this.container.createComponent(this.cellDataType.getCellComponent());

    if (this.iconDataType !== null) {
      this.cellRef = this.container.createComponent(DataTypeCellComponent);
      this.cellRef.setInput('iconName', this.iconDataType.second.getIconName());
    }
  }
}

