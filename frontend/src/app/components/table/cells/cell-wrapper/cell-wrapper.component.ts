import {
  AfterViewInit,
  Component, ComponentRef,
  ElementRef,
  Input,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {DataTypeCellComponent} from '../data-type-cell/data-type-cell.component';
import {HeaderCell} from '../../../../model/table/header-cell';
import {Cell} from '../../../../model/table/cell';
import {BaseCellComponent} from '../base-cell-component';

@Component({
  selector: 'app-cell-wrapper',
  standalone: true,
  imports: [],
  template: `
    <div #borders class="d-flex align-items-center overflow-auto p-2">
      <ng-container #container></ng-container>
    </div>`,
  styles: [`
    div {
      height: var(--cell-table-min-height);
      margin: var(--cell-table-margin);
      min-height: var(--cell-table-min-height);
    }
  `]
})
export class CellWrapperComponent implements AfterViewInit {

  @Input() cell: Cell | null = null;
  @Input() headerCell: HeaderCell | null = null;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild('borders', { static: true }) bordersToHighLight!: ElementRef;


  ngAfterViewInit(): void {
    if (this.cell !== null) {
      const cellRef: ComponentRef<BaseCellComponent> = this.container.createComponent(this.cell.cellDataType.getCellComponent());
      this.cell.cellRef = cellRef;
      cellRef.setInput('value', this.cell.value);
    }

    if (this.headerCell !== null) {
      this.headerCell.cellRef = this.container.createComponent(DataTypeCellComponent);
      this.headerCell.cellRef.setInput('iconName', this.headerCell.columnDataType.getIconName());
      this.headerCell.cellRef.setInput('value', this.headerCell.value);
    }
  }
}

