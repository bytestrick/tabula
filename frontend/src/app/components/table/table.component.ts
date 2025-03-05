import {
  Component, ComponentRef,
  OnInit,
  Renderer2,
  Type,
} from '@angular/core';
import {Table} from '../../model/table';
import {IDataType} from '../../model/data-type.interface';
import {NgForOf, NgIf} from '@angular/common';
import {TextualDataType} from '../../model/concrete-data-type/textual-data-type';
import {InputPopUpComponent} from '../input-pop-up/input-pop-up.component';
import {Pair} from '../../types/pair';
import {BaseInputComponent} from '../input-components/base-input-component';
import {BaseCellComponent} from './cells/base-cell-component';
import {CellWrapperComponent} from './cells/cell-wrapper/cell-wrapper.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgForOf,
    InputPopUpComponent,
    NgIf,
    CellWrapperComponent,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {

  private table: Table = new Table();
  private currentCellSelected: ComponentRef<BaseCellComponent> | null = null;

  protected dataTypesIcons!: Type<BaseCellComponent>[];
  protected rows!: Type<BaseCellComponent>[][];
  protected lastRowColspan: number = 1;
  protected isInputMethodVisible: boolean = false;

  protected inputMethodPosition: Pair<number, number> = { first: 0, second: 0 };
  protected inputComponent: Type<BaseInputComponent> | null = null;
  protected inputComponentInitialValue: any = null;

  tableName = "New Table";


  constructor(private renderer: Renderer2) {
    this.table.addNewDataType(new TextualDataType(this.renderer));
    this.table.addNewRow();
  }


  ngOnInit(): void {
    this.loadTable();
  }


  loadTable() {
    this.dataTypesIcons = this.loadAllDataTypesIcons();
    this.rows = this.loadRows();
  }


  // Per ogni tipo di dato presente nella tabella ritorna il componente html che lo visualizza.
  private loadAllDataTypesIcons(): Type<BaseCellComponent>[] {
    const dataTypes: IDataType[] = this.table.getDataTypes();
    const dataTypesIcons: Type<BaseCellComponent>[] = [];

    for (let dataType of dataTypes) {
      dataTypesIcons.push(dataType.getDataTypeIcon());
    }

    return dataTypesIcons;
  }


  private loadRows(): Type<BaseCellComponent>[][] {
    const rows: Type<BaseCellComponent>[][] = [];

    for (let i: number = 0; i < this.table.getRowSize(); ++i) {
      rows.push([]);

      for (let j: number = 0; j < this.table.getDataTypesAmount(); ++j) {
        rows[i].push(this.table.getDataType(j).getCellComponent())
      }
    }

    return rows;
  }


  addNewDataType(dataType: IDataType): void {
    this.table.addNewDataType(dataType);
    this.dataTypesIcons.push(dataType.getDataTypeIcon());

    // update rows.
    for (let i: number = 0; i < this.rows.length; ++i)
      this.rows[i].push(dataType.getCellComponent());
  }


  addNewRow(): void {
    this.table.addNewRow();
    this.rows.push([]);

    for (let i: number = 0; i < this.table.getDataTypesAmount(); ++i)
      this.rows[this.rows.length - 1][i] = this.table.getDataType(i).getCellComponent();
  }


  onAddNewRow(): void {
    this.addNewRow();
  }


  onAddNewColumn(): void {
    const dataType: IDataType = new TextualDataType(this.renderer);
    this.addNewDataType(dataType);

    ++this.lastRowColspan;
  }


  onCellDoubleClick(event: MouseEvent, colIndex: number, cell: ComponentRef<BaseCellComponent> | null): void {
    const dataType: IDataType = this.table.getDataType(colIndex);
    this.showInputMethod(event.x, event.y, dataType, cell);
  }


  showInputMethod(x: number, y: number, dataType: IDataType, cell: ComponentRef<BaseCellComponent> | null): void {
    this.currentCellSelected = cell;
    this.inputComponent = dataType.getInputComponent(); // Assegna il metodo di input corretto in base al tipo presente sulla colonna corrispondente.
    this.inputComponentInitialValue = cell?.instance.getValue();

    this.isInputMethodVisible = true;
    this.inputMethodPosition = { first: x, second: y };
  }


  hideInputMethod(): void {
    this.currentCellSelected = null;
    this.isInputMethodVisible = false;
  }


  onInputPopUpClosed(value: any): void {
    if (!(value === null))
      this.currentCellSelected?.instance?.setValue(value);

    this.hideInputMethod();
  }
}
