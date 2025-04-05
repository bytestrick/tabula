import {
  Component, ComponentRef, createComponent, ElementRef, EnvironmentInjector, HostListener, inject, OnDestroy, OnInit,
} from '@angular/core';
import {Table} from '../../model/table/table';
import {IDataType} from '../../model/data-types/i-data-type';
import {NgForOf} from '@angular/common';
import {TextualDataType} from '../../model/data-types/concrete-data-type/textual-data-type';
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
import {PopUpManagerService} from '../../services/pop-up-manager.service';
import {ContextualMenuComponent} from '../contextual-menu/contextual-menu.component';
import {PopUp} from '../pop-up-component/pop-up.component';
import {ToastService} from '../../toast/toast.service';
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
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit, OnDestroy {

  private clickedCellCoords: Pair<number, number> | null = null;
  private toastService: ToastService = inject(ToastService);

  protected isAnElementDragged: boolean = false;

  protected table: Table = new Table();

  protected hoveredRowIndex: number | null = null;
  protected hoveredColIndex: number | null = null;

  protected readonly HEADER_ROW_INDEX: number = -1;
  protected readonly INVALID_CELL_INDEX: number = -2;

  protected readonly INPUT_METHOD_POP_UP: string = 'inputMethod';
  protected readonly DATA_TYPE_CHOOSER_POP_UP: string = 'dataTypeChooser';
  protected readonly TABLE_CONTEXTUAL_MENU: string = 'contextualMenu';

  protected previewLimit: number = 5; // Preview che compare durante il drag di righe e colonne.


  constructor(private tableRef: ElementRef, private envInj: EnvironmentInjector, protected popUpManagerService: PopUpManagerService) {
    // Inizializza il componente in modo tale da avere già una colonna e una riga.
    this.table.addNewHeader(new TextualDataType());
    this.table.addNewRow();
  }


  ngOnDestroy(): void {
    this.popUpManagerService.deletePopUp(this.INPUT_METHOD_POP_UP);
    this.popUpManagerService.deletePopUp(this.DATA_TYPE_CHOOSER_POP_UP);
    this.popUpManagerService.deletePopUp(this.TABLE_CONTEXTUAL_MENU);
  }


  ngOnInit(): void {
    this.createTableContextualMenu();
    this.createDataTypeChooser();
  }


  private createTableContextualMenu(): void {
    const tableContextualMenu: ComponentRef<ContextualMenuComponent> = createComponent<ContextualMenuComponent>(
      ContextualMenuComponent,
      { environmentInjector: this.envInj }
    );
    tableContextualMenu.setInput('doOnDelete', (cellCord: Pair<number | null, number | null>, actionTarget: string): void => {
      if (cellCord.first == null && cellCord.second == null) {
        this.toastService.actionNotAllowed('You can\'t perform this operation here');
        return;
      }

      switch (actionTarget) {
        case tableContextualMenu.instance.TARGET_ROW: {
          if (cellCord.first == null) {
            this.toastService.actionNotAllowed('you can\'t delete this row');
          }
          else if (this.table.getRowsNumber() <= 1) {
            this.toastService.actionNotAllowed('There must be at least one row');
          }
          else {
            this.table.deleteRow(cellCord.first);
          }
          break;
        }
        case tableContextualMenu.instance.TARGET_COLUMN: {
          if (cellCord.second == null) {
            this.toastService.actionNotAllowed('you can\'t delete this column');
          }
          else if (this.table.getHeadersCellsAmount() <= 1) {
            this.toastService.actionNotAllowed('There must be at least one column');
          }
          else {
            this.table.deleteColumn(cellCord.second);
          }
          break;
        }
      }
    });
    tableContextualMenu.setInput('doOnDuplicate', (cellCord: Pair<number | null, number | null>, actionTarget: string): void => {
      if (cellCord.first == null && cellCord.second == null) {
        this.toastService.actionNotAllowed('You can\'t perform this operation here');
        return;
      }

      switch (actionTarget) {
        case tableContextualMenu.instance.TARGET_ROW: {
          if (cellCord.first == null) {
            this.toastService.actionNotAllowed('you can\'t duplicate this row');
          }
          else {
            this.table.duplicateRow(cellCord.first);
          }
          break;
        }
        case tableContextualMenu.instance.TARGET_COLUMN: {
          if (cellCord.second == null) {
            this.toastService.actionNotAllowed('you can\'t duplicate this column');
          }
          else {
            this.table.duplicateColumn(cellCord.second);
          }
          break;
        }
      }
    });

    this.popUpManagerService.createPopUp(this.TABLE_CONTEXTUAL_MENU, tableContextualMenu);
  }


  private createDataTypeChooser(): void {
    const dataTypeChooser: ComponentRef<BaseInputComponent> = createComponent<BaseInputComponent>(
      DataTypesChooserComponent,
      { environmentInjector: this.envInj }
    );

    this.popUpManagerService.createPopUp(this.DATA_TYPE_CHOOSER_POP_UP, dataTypeChooser);
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


  onNewHeaderAdded(event: MouseEvent): void {
    this.showDataTypeChooser(new Pair(event.x, event.y), (value: any): void => this.addNewHeader(value as IDataType));
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

    this.popUpManagerService.getOrCreatePopUp(this.INPUT_METHOD_POP_UP, inputComponent)?.instance.show(position);
  }


  showDataTypeChooser(position: Pair<number, number>, doAfterInputConfirmation: (value: any) => void): void {
    const dataTypeChooserPopUpRef: ComponentRef<PopUp> | undefined = this.popUpManagerService.getPopUp(this.DATA_TYPE_CHOOSER_POP_UP);
    dataTypeChooserPopUpRef?.instance.getContent()?.setInput('doAfterInputConfirmation', doAfterInputConfirmation);

    dataTypeChooserPopUpRef?.instance.show(position);
  }


  onMouseEnteredCell(rowIndex: number, colIndex: number): void {
    this.hoveredRowIndex = rowIndex === this.INVALID_CELL_INDEX ? null : rowIndex;
    this.hoveredColIndex = colIndex === this.INVALID_CELL_INDEX ? null : colIndex;
  }


  onMouseLeaveTable(): void {
    this.hoveredRowIndex = null;
    this.hoveredColIndex = null;
  }


  onColumnAddedAt(event: MouseEvent, colIndex: number): void {
    this.showDataTypeChooser(new Pair(event.x, event.y), (value: any): void => this.insertNewColAt(colIndex, value as IDataType));
  }


  onRowAddedAt(rowIndex: number): void {
    this.insertNewRowAt(rowIndex);
  }


  onColumnDropped(event: CdkDragDrop<any, any>): void {
    if (this.hoveredColIndex === null)
      return;

    if (!this.table.hasColumnSelected()) {
      if (event.previousIndex !== this.hoveredColIndex)
        this.table.moveColumn(event.previousIndex, this.hoveredColIndex);
    }
    else {
      this.table.moveSelectedColumns(this.hoveredColIndex);
    }
  }


  onRowDropped(event: CdkDragDrop<any, any>): void {
    if (this.hoveredRowIndex === null)
      return;

    if (!this.table.hasRowsSelected()) {
      if (event.previousIndex !== this.hoveredRowIndex)
        this.table.moveRow(event.previousIndex, this.hoveredRowIndex);
    }
    else {
      this.table.moveSelectedRows(this.hoveredRowIndex);
    }
  }


  onDragEnded(): void {
    this.isAnElementDragged = false;
  }


  onDragStarted(): void {
    this.isAnElementDragged = true;
  }


  onColumnSelectionToggled(value: boolean, columnIndex: number): void {
    if (value)
      this.table.selectColumn(columnIndex);
    else
      this.table.deselectColumn(columnIndex);
  }


  onRowSelectionToggled(value: boolean, rowIndex: number): void {
    if (value)
      this.table.selectRow(rowIndex);
    else
      this.table.deselectRow(rowIndex);
  }


  isColumnSelected(columnIndex: number): boolean {
    return this.table.isColumnSelected(columnIndex);
  }


  isRowSelected(rowIndex: number): boolean {
    return this.table.isRowSelected(rowIndex)
  }


  protected canDisableCellHighlight(): boolean {
    return (
      !this.popUpManagerService.isPopUpShown(this.INPUT_METHOD_POP_UP) &&
      !this.popUpManagerService.isPopUpShown(this.TABLE_CONTEXTUAL_MENU)
    );
  }


  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    if (!this.tableRef.nativeElement.contains(event.target))
      return;

    event.preventDefault();

    const contextualMenuRef: ComponentRef<PopUp> | undefined = this.popUpManagerService.getPopUp(this.TABLE_CONTEXTUAL_MENU);
    contextualMenuRef?.instance.getContent()?.setInput('cellCord', new Pair(this.hoveredRowIndex, this.hoveredColIndex));
    contextualMenuRef?.instance.show(new Pair(event.x, event.y));
  }
}
