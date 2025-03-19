import {
  Component,
  Type,
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
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

  private currentCellSelected: Cell | null = null;

  protected rowsSelected: Set<number> = new Set<number>;
  protected colsSelected: Set<number> = new Set<number>;

  protected isAnElementDragged: boolean = false;

  protected table: Table = new Table();

  protected isInputMethodVisible: boolean = false;

  protected inputMethodPosition: Pair<number, number> = {first: 0, second: 0};
  protected inputComponent: Type<BaseInputComponent> | null = null;
  protected inputComponentInitialValue: any = null;

  protected hoveredRowIndex: number | null = null;
  protected hoveredColIndex: number | null = null;

  tableName: string = "New Table";
  previewLimit: number = 5;


  constructor() {
    // inizializza il componente in modo tale da avere già una colonna e una riga
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


  onDoubleClickedCell(event: MouseEvent, cell: Cell): void {
    this.showInputMethod(event.x, event.y, cell);
  }


  showInputMethod(x: number, y: number, cell: Cell): void {
    this.currentCellSelected = cell;
    this.inputComponent = cell.cellDataType.getInputComponent(); // Assegna il metodo di input corretto in base al tipo presente sulla colonna corrispondente.
    this.inputComponentInitialValue = cell.value; // Valore di default mostrato quando compare il popup per prendere l'input.

    this.isInputMethodVisible = true;
    this.inputMethodPosition = new Pair(x, y);
  }


  showDataTypeChooser(x: number, y: number): void {
    this.currentCellSelected = null;
    this.inputComponent = DataTypesChooserComponent;
    this.inputComponentInitialValue = null;

    this.isInputMethodVisible = true;
    this.inputMethodPosition = new Pair(x, y);
  }


  hideInputMethod(): void {
    this.currentCellSelected = null;
    this.isInputMethodVisible = false;
  }


  onInputPopUpClosed(value: any): void {
    if (!(value === null)) {
      if (this.currentCellSelected !== null && this.colsSelected.size === 0 && this.rowsSelected.size === 0) {
        this.currentCellSelected.value = value;
      }
      else {
        this.rowsSelected.forEach(e => {
          for (let r of this.table.getRow(e))
            r.value = value;
        });

        this.colsSelected.forEach(e => {
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


  onColumnSelectionToggled(value: boolean, colIndex: number): void {
    if (value)
      this.colsSelected.add(colIndex);
    else
      this.colsSelected.delete(colIndex);
  }


  onRowSelectionToggled(value: boolean, rowIndex: number): void {
    if (value)
      this.rowsSelected.add(rowIndex);
    else
      this.rowsSelected.delete(rowIndex);
  }
}
