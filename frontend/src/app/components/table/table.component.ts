import {
  Component, ComponentRef,
  OnInit, QueryList,
  Renderer2,
  Type,
  ViewChildren,
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

  @ViewChildren('tableBody') tableBodyChildren!: QueryList<ComponentRef<any>>;

  tableName = "New Table";
  dataTypesIcons!: HTMLElement[];
  tableRows!: Type<BaseCellComponent>[][];
  colspan: number = 1;

  isInputMethodVisible: boolean = false;
  inputMethodPosition: Pair<number, number> = { first: 0, second: 0 };
  inputComponent: Type<BaseInputComponent> | null = null;

  private table: Table = new Table();
  private cellSelected: ComponentRef<BaseCellComponent> | null = null;


  constructor(private renderer: Renderer2) {
    this.table.addNewDataType(new TextualDataType(this.renderer));
    this.table.addNewRow();
  }


  ngOnInit(): void {
    this.dataTypesIcons = this.getAllDataTypesIcons();
    this.tableRows = this.getAllTableCells();
  }


  // Per ogni tipo di dato presente nella tabella ritorna il componente html che lo visualizza.
  getAllDataTypesIcons(): HTMLElement[] {
    const dataTypes: IDataType[] = this.table.getDataTypes();
    const dataTypesIcons: HTMLElement[] = [];

    for (let dataType of dataTypes) {
      dataTypesIcons.push(dataType.getDataTypeIcon());
    }

    return dataTypesIcons;
  }


  getAllTableCells(): Type<BaseCellComponent>[][] {
    const tableElement: Type<BaseCellComponent>[][] = [];

    for (let i: number = 0; i < this.table.getRowSize(); ++i) {
      tableElement.push([]);

      for (let j: number = 0; j < this.table.getDataTypesAmount(); ++j) {
        tableElement[i].push(this.table.getDataType(j).getCellComponent())
      }
    }

    return tableElement;
  }


  addNewRow(): void {
    this.table.addNewRow();
    this.tableRows = this.getAllTableCells(); // TODO: fare l'aggiornamento delle righe in modo più efficente.
  }


  addNewColumn(): void {
    this.table.addNewDataType(new TextualDataType(this.renderer));
    this.dataTypesIcons = this.getAllDataTypesIcons();
    this.tableRows = this.getAllTableCells(); // TODO: fare l'aggiornamento delle righe in modo più efficente.
    ++this.colspan;
  }


  onCellDoubleClick(event: MouseEvent, colIndex: number, cell: ComponentRef<BaseCellComponent> | null): void {
    const dataType: IDataType = this.table.getDataType(colIndex);
    this.inputComponent = dataType.getInputComponent(); // Assegna il metodo di input corretto in base al tipo presente sulla colonna corrispondente.
    this.cellSelected = cell;
    this.showInputMethod(event.x, event.y);
  }


  showInputMethod(x: number, y: number): void {
    this.isInputMethodVisible = true;
    this.inputMethodPosition = { first: x, second: y };
  }


  onInputPopUpClosed(value: any): void {
    if (!(value === null))
      this.cellSelected?.instance?.setValue(value);

    this.cellSelected = null;
    this.isInputMethodVisible = false;
  }
}
