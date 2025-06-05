import {
  Component,
  ComponentRef,
  createComponent,
  ElementRef,
  EnvironmentInjector,
  HostListener,
  inject, OnDestroy,
  OnInit, TrackByFunction, Type,
} from '@angular/core';
import {IDataType} from '../../model/data-types/i-data-type';
import {NgForOf, NgIf} from '@angular/common';
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
import {ActivatedRoute} from '@angular/router';
import {Row} from '../../model/table/row';
import {InputComponentFactoryService} from '../../services/input-component-factory.service';
import {InputComponentConfiguration} from '../input-components/InputComponentConfiguration';

@Component({
  selector: 'tbl-table',
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
    NgIf,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  providers: [TableService]
})
export class TableComponent implements OnInit, OnDestroy {

  protected isAnElementDragged: boolean = false;

  protected tableService: TableService = inject(TableService);

  protected hoveredRowIndex: number = this.tableService.INVALID_CELL_INDEX;
  protected hoveredColIndex: number = this.tableService.INVALID_CELL_INDEX;

  protected previewLimit: number = 5; // Preview that appears when dragging rows and columns.

  private envInj: EnvironmentInjector = inject(EnvironmentInjector);
  private tableRef: ElementRef = inject(ElementRef);
  private popUpManagerService: PopUpManagerService = inject(PopUpManagerService);
  private inputComponentFactory: InputComponentFactoryService = inject(InputComponentFactoryService);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private tableInputPopUp!: ComponentRef<PopUp>;
  private tableContextualMenu!: ComponentRef<PopUp>;

  trackByRowId: TrackByFunction<Row> = (_index: number, item: Row): string => item.id;


  ngOnDestroy(): void {
    this.tableInputPopUp.destroy();
    this.tableContextualMenu.destroy();
  }


  ngOnInit(): void {
    this.tableInputPopUp = this.popUpManagerService.createPopUpWithoutContent()
    this.tableContextualMenu = this.popUpManagerService.createPopUp(this.createTableContextualMenu(this.tableService));

    const tableId: string = this.activatedRoute.snapshot.paramMap.get('table-id') || '';
    this.tableService.init(tableId);
  }


  private createTableContextualMenu(tableService: TableService): ComponentRef<TableContextualMenuComponent> {
    const tableContextualMenu: ComponentRef<TableContextualMenuComponent> = createComponent<TableContextualMenuComponent>(
      TableContextualMenuComponent,
      { environmentInjector: this.envInj }
    );
    tableContextualMenu.setInput('tableService', tableService);

    return tableContextualMenu;
  }


  showDataTypeChooser(position: Pair<number, number>,
                              doAfterInputConfirmation: (value: any) => void): void {

    const dataTypeChooser: ComponentRef<DataTypesChooserComponent> =
      this.inputComponentFactory.createInputComponent(
        DataTypesChooserComponent,
        {
          doAfterInputConfirmation: doAfterInputConfirmation
        }
      );

    this.tableInputPopUp.instance.changeContent(dataTypeChooser);
    this.tableInputPopUp.instance.show(position);
  }


  showCellInputMethod<T extends BaseInputComponent>(position: Pair<number, number>,
                                                    inputComponent: Type<T>,
                                                    config: InputComponentConfiguration): void {

    const dataTypeChooser: ComponentRef<T> =
      this.inputComponentFactory.createInputComponent(
        inputComponent, config
      );

    this.tableInputPopUp.instance.changeContent(dataTypeChooser);
    this.tableInputPopUp.instance.show(position);
  }


  onNewRowAdded(): void {
    this.tableService.addNewRow();
  }


  onNewHeaderAdded(event: MouseEvent): void {
    this.showDataTypeChooser(
      new Pair(event.x, event.y),
      (value: any): void => this.tableService.appendNewColumn(value as IDataType)
    );
  }


  onDoubleClickedCell(event: MouseEvent, cord: CellCord): void {
    const cell: Cell | null = this.tableService.getCellFromCoords(cord);

    if (cell == null)
      return;

    const config: InputComponentConfiguration = {
      startingValue: cell.value,
      doAfterInputDataTypeConfirmation: (value: string, dataTypeId: number): void =>
        this.tableService.setCellsValue(cord, value, dataTypeId)
    }

    this.showCellInputMethod(new Pair(event.x, event.y), cell.cellDataType.getInputComponent(), config);
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
      (value: any): void => this.tableService.insertNewColumnAt(colIndex, value as IDataType)
    );
  }


  onRowAddedAt(rowIndex: number): void {
    this.tableService.insertNewRowAt(rowIndex);
  }


  onColumnDropped(event: CdkDragDrop<any, any>): void {
    if (this.hoveredColIndex === null)
      return;

    this.tableService.moveColumns(event.previousIndex, this.hoveredColIndex);
  }


  onRowDropped(event: CdkDragDrop<any, any>): void {
    if (this.hoveredRowIndex === null)
      return;

    this.tableService.moveRows(event.previousIndex, this.hoveredRowIndex);
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
    return !this.tableInputPopUp.instance.isVisible;
  }


  protected createCellCord(rowIndex: number, colIndex: number, isHeaderCell: boolean): CellCord {
    return new CellCord(rowIndex, colIndex, isHeaderCell);
  }


  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    if (!this.tableRef.nativeElement.contains(event.target))
      return;

    event.preventDefault();
    this.tableContextualMenu.instance.content?.setInput('cellCord', new Pair(this.hoveredRowIndex, this.hoveredColIndex));
    this.tableContextualMenu.instance.show(new Pair(event.x, event.y));
  }
}
