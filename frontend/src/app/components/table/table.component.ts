import {
  Component, ComponentRef, createComponent, ElementRef, EnvironmentInjector, HostListener, inject, OnDestroy, OnInit,
} from '@angular/core';
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
import {TableContextualMenuComponent} from '../table-contextual-menu/table-contextual-menu.component';
import {PopUp} from '../pop-up-component/pop-up.component';
import {TableService} from '../../services/table.service';
import {CellCord} from '../../model/table/cell-cord';

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

  protected isAnElementDragged: boolean = false;

  protected tableService: TableService = inject(TableService)

  protected hoveredRowIndex: number = this.tableService.INVALID_CELL_INDEX;
  protected hoveredColIndex: number = this.tableService.INVALID_CELL_INDEX;

  protected readonly INPUT_METHOD_POP_UP: string = 'inputMethod';
  protected readonly DATA_TYPE_CHOOSER_POP_UP: string = 'dataTypeChooser';
  protected readonly TABLE_CONTEXTUAL_MENU: string = 'contextualMenu';

  protected previewLimit: number = 5; // Preview che compare durante il drag di righe e colonne.


  constructor(private tableRef: ElementRef, private envInj: EnvironmentInjector, protected popUpManagerService: PopUpManagerService) {
    // Inizializza il componente in modo tale da avere già una colonna e una riga.
    this.tableService.addNewHeader(new TextualDataType());
    this.tableService.addNewRow();
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
    const tableContextualMenu: ComponentRef<TableContextualMenuComponent> = createComponent<TableContextualMenuComponent>(
      TableContextualMenuComponent,
      { environmentInjector: this.envInj }
    );

    this.popUpManagerService.createPopUp(this.TABLE_CONTEXTUAL_MENU, tableContextualMenu);
  }


  private createDataTypeChooser(): void {
    const dataTypeChooser: ComponentRef<BaseInputComponent> = createComponent<BaseInputComponent>(
      DataTypesChooserComponent,
      { environmentInjector: this.envInj }
    );

    this.popUpManagerService.createPopUp(this.DATA_TYPE_CHOOSER_POP_UP, dataTypeChooser);
  }


  onNewRowAdded(): void {
    this.tableService.addNewRow();
  }


  onNewHeaderAdded(event: MouseEvent): void {
    this.showDataTypeChooser(
      new Pair(event.x, event.y),
      (value: any): void => this.tableService.addNewHeader(value as IDataType)
    );
  }


  onDoubleClickedCell(event: MouseEvent, cord: CellCord): void {
    this.showInputMethod(new Pair(event.x, event.y), cord);
  }



  showInputMethod(position: Pair<number, number>, cord: CellCord): void {
    const cell: Cell | null = this.tableService.getCellFromCoords(cord);

    if (cell == null)
      return;

    const inputComponent: ComponentRef<BaseInputComponent> = createComponent<BaseInputComponent>(
      cell.cellDataType.getInputComponent(),
      { environmentInjector: this.envInj }
    );
    inputComponent.setInput('startingValue', cell.value);
    inputComponent.setInput('doAfterInputConfirmation', (value: any): void => this.tableService.setCellValue(cord, value));

    this.popUpManagerService.getOrCreatePopUp(this.INPUT_METHOD_POP_UP, inputComponent)?.instance.show(position);
  }


  showDataTypeChooser(position: Pair<number, number>, doAfterInputConfirmation: (value: any) => void): void {
    const dataTypeChooserPopUpRef: ComponentRef<PopUp> | undefined = this.popUpManagerService.getPopUp(this.DATA_TYPE_CHOOSER_POP_UP);
    dataTypeChooserPopUpRef?.instance.getContent()?.setInput('doAfterInputConfirmation', doAfterInputConfirmation);

    dataTypeChooserPopUpRef?.instance.show(position);
  }


  onMouseEnteredCell(rowIndex: number, colIndex: number): void {
    this.hoveredRowIndex = rowIndex;
    this.hoveredColIndex = colIndex;
  }


  onMouseLeaveTable(): void {
    this.hoveredRowIndex = this.tableService.INVALID_CELL_INDEX;
    this.hoveredColIndex = this.tableService.INVALID_CELL_INDEX;
  }


  onColumnAddedAt(event: MouseEvent, colIndex: number): void {
    this.showDataTypeChooser(
      new Pair(event.x, event.y),
      (value: any): void => this.tableService.insertNewDataTypeAt(colIndex, value as IDataType)
    );
  }


  onRowAddedAt(rowIndex: number): void {
    this.tableService.insertNewRowAt(rowIndex);
  }


  onColumnDropped(event: CdkDragDrop<any, any>): void {
    if (this.hoveredColIndex === null)
      return;

    if (!this.tableService.hasColumnSelected()) {
      if (event.previousIndex !== this.hoveredColIndex)
        this.tableService.moveColumn(event.previousIndex, this.hoveredColIndex);
    }
    else {
      this.tableService.moveSelectedColumns(this.hoveredColIndex);
    }
  }


  onRowDropped(event: CdkDragDrop<any, any>): void {
    if (this.hoveredRowIndex === null)
      return;

    if (!this.tableService.hasRowsSelected()) {
      if (event.previousIndex !== this.hoveredRowIndex)
        this.tableService.moveRow(event.previousIndex, this.hoveredRowIndex);
    }
    else {
      this.tableService.moveSelectedRows(this.hoveredRowIndex);
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
      this.tableService.selectColumn(columnIndex);
    else
      this.tableService.deselectColumn(columnIndex);
  }


  onRowSelectionToggled(value: boolean, rowIndex: number): void {
    if (value)
      this.tableService.selectRow(rowIndex);
    else
      this.tableService.deselectRow(rowIndex);
  }


  changeDataType(event: MouseEvent, columnIndex: number): void {
    this.showDataTypeChooser(
      new Pair(event.x, event.y),
      (newDataType: any): void => this.tableService.changeColumnDataType(columnIndex, newDataType as IDataType)
    );
  }


  isColumnSelected(columnIndex: number): boolean {
    return this.tableService.isColumnSelected(columnIndex);
  }


  isRowSelected(rowIndex: number): boolean {
    return this.tableService.isRowSelected(rowIndex)
  }


  protected canDisableCellHighlight(): boolean {
    return (
      !this.popUpManagerService.isPopUpShown(this.INPUT_METHOD_POP_UP) &&
      !this.popUpManagerService.isPopUpShown(this.TABLE_CONTEXTUAL_MENU)
    );
  }


  protected createCellCord(rowIndex: number, colIndex: number, isHeaderCell: boolean): CellCord {
    return new CellCord(rowIndex, colIndex, isHeaderCell);
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
