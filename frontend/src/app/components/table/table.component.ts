import {Component, ElementRef, ViewChild, Renderer2} from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {

  @ViewChild('columnsContainer') columnsContainer!: ElementRef;
  @ViewChild('rowsContainer') rowsContainer!: ElementRef;

  tableName = "New Table";
  isEmpty = true;


  constructor(private renderer2: Renderer2) {}


  getColumnsNumber(): number {
    return this.columnsContainer.nativeElement.children.length - 1;
  }


  getRowsNumber(): number {
    return this.rowsContainer.nativeElement.children.length - 1;
  }


  private createCell(): HTMLElement {
    const rowData = this.renderer2.createElement('td');
    const text = this.renderer2.createText('...');

    this.renderer2.appendChild(rowData, text);

    return rowData;
  }


  addNewColumn(): void {
    if (this.isEmpty) {
      this.isEmpty = false;
      return;
    }

    const columnsNumber = this.getColumnsNumber();
    const columnsContainer = this.columnsContainer.nativeElement;
    const rowsContainer = this.rowsContainer.nativeElement;
    const newColumn = this.renderer2.createElement('th');
    const text = this.renderer2.createText('Header' + columnsNumber.toString());

    this.renderer2.appendChild(newColumn, text);

    for (let i = 0; i < this.getRowsNumber(); ++i) {
      this.renderer2.appendChild(rowsContainer.children[i], this.createCell());
    }

    this.renderer2.insertBefore(columnsContainer, newColumn, columnsContainer.children[columnsNumber])
  }


  addNewRow(): void {
    if (this.isEmpty) {
      this.isEmpty = false;
      return;
    }

    const columnsNumber = this.getColumnsNumber();
    const rowsNumber = this.getRowsNumber();
    const rowsContainer = this.rowsContainer.nativeElement;
    const newRow = this.renderer2.createElement('tr');

    for (let i = 0; i < columnsNumber - 1; ++i) {
      this.renderer2.appendChild(newRow, this.createCell());
    }

    this.renderer2.appendChild(newRow, this.createCell());
    this.renderer2.insertBefore(rowsContainer, newRow, rowsContainer.children[rowsNumber])
  }
}
