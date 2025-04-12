import {
  AfterViewInit,
  Component, ComponentRef,
  ElementRef,
  Input, OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {DataTypeCellComponent} from '../data-type-cell/data-type-cell.component';
import {HeaderCell} from '../../../../model/table/header-cell';
import {Cell} from '../../../../model/table/cell';
import {BaseCellComponent} from '../base-cell-component';
import {CellCord} from '../../../../model/table/cell-cord';

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
export class CellWrapperComponent implements AfterViewInit, OnChanges {

  @Input() cell: Cell | null = null;
  @Input() headerCell: HeaderCell | null = null;
  @Input() onChangeDataTypeCallback!: (event: MouseEvent, columnIndex: number) => void;
  @Input() cord!: CellCord;

  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild('borders', { static: true }) bordersToHighLight!: ElementRef;


  ngAfterViewInit(): void {
    if (this.cell !== null) {
      const cellRef: ComponentRef<BaseCellComponent> = this.container.createComponent(this.cell.cellDataType.getCellComponent());

      cellRef.setInput('cord', this.cord);
      cellRef.setInput('value', this.cell.value);

      this.cell.cellRef = cellRef;
    }

    if (this.headerCell !== null) {
      const headerCellRef: ComponentRef<DataTypeCellComponent> = this.container.createComponent(DataTypeCellComponent);

      headerCellRef.setInput('iconName', this.headerCell.columnDataType.getIconName());
      headerCellRef.setInput('value', this.headerCell.value);
      headerCellRef.setInput('onChangeDataTypeCallback', this.onChangeDataTypeCallback);
      headerCellRef.setInput('cord', this.cord);

      this.headerCell.cellRef = headerCellRef;
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cord']) {
      this.headerCell?.cellRef?.setInput('cord', changes['cord'].currentValue);
      this.cell?.cellRef?.setInput('cord', changes['cord'].currentValue);
    }
  }
}

