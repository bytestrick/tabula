import {
  Component, ElementRef,
  Type, ViewChild,
} from '@angular/core';
import {Table} from '../../model/table';
import {DataType} from '../../model/data-type';
import {NgForOf, NgIf} from '@angular/common';
import {TextualDataType} from '../../model/concrete-data-type/textual-data-type';
import {InputPopUpComponent} from '../input-pop-up/input-pop-up.component';
import {Pair} from '../../model/pair';
import {BaseInputComponent} from '../input-components/base-input-component';
import {CellWrapperComponent} from './cells/cell-wrapper/cell-wrapper.component';
import {HighlightBordersDirective} from '../../directive/highlight-borders.directive';
import {TableOrganizerComponent} from '../table-organizer/table-organizer.component';
import {DataTypesChooserComponent} from '../input-components/data-types-chooser/data-types-chooser.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPreview,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import {FormsModule} from '@angular/forms';
import {Cell} from '../../model/cell';
import {SelectDirective} from '../../directive/select.directive';
import {ResizableTableColumnDirective} from '../../directive/resizable-table-column.directive';
import {UpdateColumnsDirective} from '../../directive/update-columns.directive';
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgForOf,
    InputPopUpComponent,
    NgIf,
    CellWrapperComponent,
    HighlightBordersDirective,
    TableOrganizerComponent,
    CdkDropList,
    CdkDrag,
    CdkDragPreview,
    FormsModule,
    SelectDirective,
    ResizableTableColumnDirective,
    UpdateColumnsDirective,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

  private clickedCellCoords: { i: number, j: number } | null = null;

  protected isAnElementDragged: boolean = false;

  protected table: Table = new Table();

  protected isInputMethodVisible: boolean = false;

  protected inputMethodPosition: Pair<number, number> = {first: 0, second: 0};
  protected inputComponent: Type<BaseInputComponent> | null = null;
  protected inputComponentInitialValue: any = null;

  protected hoveredRowIndex: number | null = null;
  protected hoveredColIndex: number | null = null;

  previewLimit: number = 5; // Preview che compare durante il drag di righe e colonne.


  constructor() {
    // Inizializza il componente in modo tale da avere già una colonna e una riga.
    this.table.addNewHeader(new TextualDataType());
    this.table.addNewRow();
  }


  insertNewRowAt(rowIndex: number): void {
    if (rowIndex >= 0 && rowIndex < this.table.getRowsNumber()) {
      this.table.insertNewRowAt(rowIndex);
    }
  }


  insertNewColAt(colIndex: number, dataType: DataType): void {
    if (colIndex >= 0 && colIndex < this.table.getHeadersCellsAmount()) {
      this.table.insertNewDataTypeAt(colIndex, dataType);
    }
  }


  addNewCol(dataType: DataType): void {
    this.table.addNewHeader(dataType);
  }


  addNewRow(): void {
    this.table.addNewRow();
  }


  onNewRowAdded(): void {
    this.addNewRow();
  }


  onNewColumnAdded(): void {
    const dataType: DataType = new TextualDataType();
    this.showDataTypeChooser(0, 0);
    this.addNewCol(dataType);
  }


  onDoubleClickedCell(event: MouseEvent, rowIndex: number, columnIndex: number): void {
    this.showInputMethod(event.x, event.y, rowIndex, columnIndex);
  }


  private getCellFromCoords(i: number, j: number): Cell {
    return i === -1 ?
      this.table.getHeaderCell(j) :
      this.table.getCell(i, j);
  }


  showInputMethod(x: number, y: number, rowIndex: number, columnIndex: number): void {
    this.clickedCellCoords = { i: rowIndex, j: columnIndex };
    const cell: Cell = this.getCellFromCoords(this.clickedCellCoords.i, this.clickedCellCoords.j);
    this.inputComponent = cell.cellDataType.getInputComponent(); // Assegna il metodo di input corretto in base al tipo presente sulla colonna corrispondente.
    this.inputComponentInitialValue = cell.value; // Valore di default mostrato quando compare il popup per prendere l'input.

    this.isInputMethodVisible = true;
    this.inputMethodPosition = new Pair(x, y);
  }


  showDataTypeChooser(x: number, y: number): void {
    this.clickedCellCoords = null;
    this.inputComponent = DataTypesChooserComponent;
    this.inputComponentInitialValue = null;

    this.isInputMethodVisible = true;
    this.inputMethodPosition = new Pair(x, y);
  }


  hideInputMethod(): void {
    this.clickedCellCoords = null;
    this.isInputMethodVisible = false;
  }


  onInputPopUpClosed(value: any): void {
    if (value !== null && this.clickedCellCoords !== null) {
      if (!this.table.isRowSelected(this.clickedCellCoords.i) && !this.table.isColumnSelected(this.clickedCellCoords.j)) {
        const cell: Cell = this.getCellFromCoords(this.clickedCellCoords.i, this.clickedCellCoords.j);
        cell.value = value;
      }
      else {
        this.table.doForEachRowSelected(e => {
          for (let r of this.table.getRow(e))
            r.value = value;
        });

        this.table.doForEachColumnSelected(e => {
          for (let c of this.table.getCol(e))
            c.value = value;
        });
      }
    }

    this.hideInputMethod();
  }


  onMouseEnteredCell(rowIndex: number, colIndex: number): void {
    this.hoveredRowIndex = rowIndex === -1 ? null : rowIndex;
    this.hoveredColIndex = colIndex === -1 ? null : colIndex;
  }


  onMouseLeaveTable(): void {
    this.hoveredRowIndex = null;
    this.hoveredColIndex = null;
  }


  onColumnAddedAt(colIndex: number): void {
    const dataType: DataType = new TextualDataType();
    this.insertNewColAt(colIndex, dataType);
  }


  onRowAddedAt(rowIndex: number): void {
    this.insertNewRowAt(rowIndex);
  }


  onColumnDropped(event: CdkDragDrop<any, any>): void {
    if (this.hoveredColIndex !== null && event.previousIndex !== this.hoveredColIndex)
      this.table.swapCol(event.previousIndex, this.hoveredColIndex);
  }


  onRowDropped(event: CdkDragDrop<any, any>): void {
    if (this.hoveredRowIndex !== null && event.previousIndex !== this.hoveredRowIndex)
      this.table.swapRow(event.previousIndex, this.hoveredRowIndex);
  }


  onDragEnded(): void {
    this.isAnElementDragged = false;
  }


  onDragStarted(): void {
    this.isAnElementDragged = true;
  }


  onColumnSelectionToggled(value: boolean, columnIndex: number): void {
    this.table.selectColumn(value, columnIndex);
  }


  onRowSelectionToggled(value: boolean, rowIndex: number): void {
    this.table.selectRow(value, rowIndex);
  }


  isColumnSelected(columnIndex: number): boolean {
    return this.table.isColumnSelected(columnIndex);
  }


  isRowSelected(rowIndex: number): boolean {
    return this.table.isRowSelected(rowIndex)
  }
}
