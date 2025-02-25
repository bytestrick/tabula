import {Component, ElementRef, ViewChild, Renderer2, AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements AfterViewInit {

  @ViewChild('columnsContainer') columnsContainer!: ElementRef;
  @ViewChild('rowsContainer') rowsContainer!: ElementRef;


  tableName = "New Table";
  columnsNumber = 0;
  rowsNumber = 0;


  constructor(private renderer2: Renderer2) {}


  ngAfterViewInit() {
    this.columnsNumber = this.columnsContainer.nativeElement.children.length;
    this.rowsNumber = this.rowsContainer.nativeElement.children.length;
  }


  private createRowData(): HTMLElement {
    const rowData = this.renderer2.createElement('td');
    const text = this.renderer2.createText('...');

    this.renderer2.appendChild(rowData, text);

    return rowData;
  }


  addNewColumn() {
    const columnsContainer = this.columnsContainer.nativeElement;
    const rowsContainer = this.rowsContainer.nativeElement;
    const newColumn = this.renderer2.createElement('th');
    const text = this.renderer2.createText('Header' + this.columnsNumber.toString());

    this.renderer2.appendChild(newColumn, text);

    for (let i = 1; i < this.rowsNumber - 1; ++i) {
      this.renderer2.appendChild(rowsContainer.children[i], this.createRowData());
    }

    this.renderer2.insertBefore(columnsContainer, newColumn, columnsContainer.children[this.columnsNumber - 1])

    ++this.columnsNumber;
  }


  addNewRow() {
    const rowsContainer = this.rowsContainer.nativeElement;
    const newRow = this.renderer2.createElement('tr');

    for (let i = 0; i < this.columnsNumber - 2; ++i) {
      this.renderer2.appendChild(newRow, this.createRowData());
    }

    this.renderer2.appendChild(newRow, this.createRowData());
    this.renderer2.insertBefore(rowsContainer, newRow, rowsContainer.children[this.rowsNumber - 1])

    ++this.rowsNumber;
  }
}
