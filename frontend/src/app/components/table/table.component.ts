import {Component, OnInit, Renderer2, Type} from '@angular/core';
import {Table} from '../../model/table';
import {IDataType} from '../../model/data-type.interface';
import {NgForOf, NgIf} from '@angular/common';
import {TextualDataType} from '../../model/concrete-data-type/textual-data-type';
import {PopUpComponent} from '../pop-up/pop-up.component';
import {Pair} from '../../types/pair';
import {IInputComponent} from '../../model/input-component.interface';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    NgForOf,
    PopUpComponent,
    NgIf,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {

  tableName = "New Table";
  dataTypesIcons!: HTMLElement[];
  tableElement!: HTMLElement[][];
  colspan: number = 1;

  isInputMethodVisible: boolean = false;
  inputMethodPosition: Pair<number, number> = { first: 0, second: 0 };
  inputComponent: Type<IInputComponent> | null = null;

  private table: Table = new Table();


  constructor(private renderer: Renderer2) {
    this.table.addNewDataType(new TextualDataType(this.renderer));
    this.table.addNewRow();
  }


  ngOnInit(): void {
    this.dataTypesIcons = this.getAllDataTypesIcons();
    this.tableElement = this.getAllTableElements();
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


  getAllTableElements(): HTMLElement[][] {
    const tableElement: HTMLElement[][] = [];

    for (let i: number = 0; i < this.table.getRowSize(); ++i) {
      tableElement.push([]);

      for (let j: number = 0; j < this.table.getDataTypesAmount(); ++j) {
        tableElement[i].push(this.table.getDataType(j).getDataTypeHTML())
      }
    }

    return tableElement;
  }


  addNewRow(): void {
    this.table.addNewRow();
    this.tableElement = this.getAllTableElements(); // TODO: fare l'aggiornamente delle righe in modo più efficente.
  }


  addNewColumn(): void {
    this.table.addNewDataType(new TextualDataType(this.renderer));
    this.dataTypesIcons = this.getAllDataTypesIcons();
    this.tableElement = this.getAllTableElements(); // TODO: fare l'aggiornamente delle righe in modo più efficente.
    ++this.colspan;
  }


  onCellDoubleClick(event: MouseEvent, colIndex: number): void {
    const dataType: IDataType = this.table.getDataType(colIndex);
    this.inputComponent = dataType.getInputComponent();
    this.showInputMethod(event.x, event.y);
  }


  showInputMethod(x: number, y: number): void {
    this.isInputMethodVisible = true;
    this.inputMethodPosition = { first: x, second: y };
  }


  hideInputMethod(): void {
    this.isInputMethodVisible = false;
  }
}
