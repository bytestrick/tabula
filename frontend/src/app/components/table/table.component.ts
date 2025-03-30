import {
  Component, ComponentRef, createComponent, EnvironmentInjector,
  ViewChild,
} from '@angular/core';
import {Table} from '../../model/table/table';
import {IDataType} from '../../model/data-types/i-data-type';
import {NgForOf} from '@angular/common';
import {TextualDataType} from '../../model/data-types/concrete-data-type/textual-data-type';
import {PopUp} from '../pop-up-component/pop-up.component';
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
import {Cell} from '../../model/table/cell';
import {SelectDirective} from '../../directive/select.directive';
import {ResizableTableColumnDirective} from '../../directive/resizable-table-column.directive';
import {UpdateColumnsWidthDirective} from '../../directive/update-columns-width.directive';
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgForOf,
    CellWrapperComponent,
    HighlightBordersDirective,
    TableOrganizerComponent,
    CdkDropList,
    CdkDrag,
    CdkDragPreview,
    FormsModule,
    SelectDirective,
    ResizableTableColumnDirective,
    UpdateColumnsWidthDirective,
    PopUp,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

  @ViewChild('popUp') private popUp?: PopUp;

  private clickedCellCoords: Pair<number, number> | null = null;

  protected isAnElementDragged: boolean = false;

  protected table: Table = new Table();

  protected hoveredRowIndex: number | null = null;
  protected hoveredColIndex: number | null = null;

  protected readonly HEADER_ROW_INDEX: number = -1;
  protected readonly INVALID_CELL_INDEX: number = -2;

  protected previewLimit: number = 5; // Preview che compare durante il drag di righe e colonne.
  protected isPopUpVisible: boolean = false; // Per mantenere la cella selezionata anche quando il pop-up compare.



  constructor(private envInj: EnvironmentInjector) {
    // Inizializza il componente in modo tale da avere già una colonna e una riga.
    this.table.addNewHeader(new TextualDataType());
    this.table.addNewRow();
  }



  insertNewRowAt(rowIndex: number): void {
    if (rowIndex >= 0 && rowIndex < this.table.getRowsNumber()) {
      this.table.insertNewRowAt(rowIndex);
    }
  }


  insertNewColAt(colIndex: number, dataType: IDataType): void {
    if (colIndex >= 0 && colIndex < this.table.getHeadersCellsAmount()) {
      this.table.insertNewDataTypeAt(colIndex, dataType);
    }
  }


  addNewHeader(dataType: IDataType): void {
    this.table.addNewHeader(dataType);
  }


  addNewRow(): void {
    this.table.addNewRow();
  }


  onNewRowAdded(): void {
    this.addNewRow();
  }


  onNewHeaderAdded(): void {
    this.showDataTypeChooser(new Pair(0, 0), (value: any): void => this.addNewHeader(value as IDataType));
  }


  onDoubleClickedCell(event: MouseEvent, rowIndex: number, columnIndex: number): void {
    this.showInputMethod(new Pair(event.x, event.y), rowIndex, columnIndex);
  }


  private getCellFromCoords(i: number, j: number): Cell {
    return i === this.HEADER_ROW_INDEX ?
      this.table.getHeaderCell(j) :
      this.table.getCell(i, j);
  }


  private setCellValue(value: any): void {
    if (value !== null && this.clickedCellCoords !== null) {
      const cell: Cell = this.getCellFromCoords(this.clickedCellCoords.first, this.clickedCellCoords.second);

      if (!this.table.isRowSelected(this.clickedCellCoords.first) && !this.table.isColumnSelected(this.clickedCellCoords.second)) {
        cell.value = value;
      }
      else {
        this.table.doForEachRowSelected((e: number): void => {
          for (let r of this.table.getRow(e)) {
            if (cell.cellDataType.constructor === r.cellDataType.constructor)
              r.value = value;
          }
        });

        this.table.doForEachColumnSelected((e: number): void => {
          for (let c of this.table.getCol(e))
            c.value = value;
        });
      }
    }
  }


  showInputMethod(position: Pair<number, number>, rowIndex: number, columnIndex: number): void {
    this.clickedCellCoords = new Pair(rowIndex, columnIndex);
    const cell: Cell = this.getCellFromCoords(this.clickedCellCoords.first, this.clickedCellCoords.second);

    const inputComponent: ComponentRef<BaseInputComponent> = createComponent<BaseInputComponent>(
      cell.cellDataType.getInputComponent(),
      { environmentInjector: this.envInj }
    );
    inputComponent.setInput('startingValue', cell.value);
    inputComponent.setInput('doAfterInputConfirmation', (value: any): void => this.setCellValue(value));

    this.popUp?.show(inputComponent, position);
  }


  showDataTypeChooser(position: Pair<number, number>, doAfterInputConfirmation: (value: any) => void): void {
    const dataTypeChooser: ComponentRef<BaseInputComponent> = createComponent<BaseInputComponent>(
      DataTypesChooserComponent,
      { environmentInjector: this.envInj }
    );
    dataTypeChooser.setInput('doAfterInputConfirmation', doAfterInputConfirmation);

    this.popUp?.show(dataTypeChooser, position);
  }


  onMouseEnteredCell(rowIndex: number, colIndex: number): void {
    this.hoveredRowIndex = rowIndex === this.INVALID_CELL_INDEX ? null : rowIndex;
    this.hoveredColIndex = colIndex === this.INVALID_CELL_INDEX ? null : colIndex;
  }


  onMouseLeaveTable(): void {
    this.hoveredRowIndex = null;
    this.hoveredColIndex = null;
  }


  onColumnAddedAt(colIndex: number): void {
    this.showDataTypeChooser(new Pair(0, 0), (value: any): void => this.insertNewColAt(colIndex, value as IDataType));
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


  onPopUpClosed(): void {
    this.isPopUpVisible = false;
  }


  onPopUpOpened(): void {
    this.isPopUpVisible = true;
  }
}
