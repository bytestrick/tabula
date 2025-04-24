import {inject, Injectable} from '@angular/core';
import {Cell} from '../model/table/cell';
import {HeaderCell} from '../model/table/header-cell';
import {IDataType} from '../model/data-types/i-data-type';
import {TextualDataType} from '../model/data-types/concrete-data-type/textual-data-type';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {CellCord} from '../model/table/cell-cord';
import {TableApiService, TableDTO} from './table-api.service';
import {DataTypeRegistryService} from './data-type-registry.service';


@Injectable()
export class TableService {

  private dataTypeService: DataTypeRegistryService = inject(DataTypeRegistryService);
  private tableAPI: TableApiService = inject(TableApiService);

  private table: Cell[][] = [];
  private headerCells: HeaderCell[] = [];

  private selectedRows: Set<number> = new Set<number>;
  private selectedColumns: Set<number> = new Set<number>;

  private _isLoaded: boolean = false;

  private readonly HEADER_CELL_DEFAULT_NAME: string = 'New Column';

  readonly INVALID_CELL_INDEX: number = -2; // deve essere un numero negativo


  addNewHeader(dataType: IDataType): void {
    this.headerCells.push(new HeaderCell(new TextualDataType(), this.HEADER_CELL_DEFAULT_NAME, dataType));

    for (let i: number = 0; i < this.getRowsNumber(); ++i) {
      while (this.table[i].length < this.getHeadersCellsAmount()) {
        const currentDataType: IDataType = this.getColumnDataType(this.table[i].length);
        this.table[i].push(new Cell(currentDataType.getNewDataType(), null));
      }
    }

    this.tableAPI.appendNewColumn(dataType.getDataTypeId());
  }


  addNewRow(): void {
    this.table.push([]);
    const lastRowI: number = this.getRowsNumber() - 1;

    for (let i: number = 0; i < this.getHeadersCellsAmount(); ++i) {
      this.table[lastRowI].push(new Cell(this.headerCells[i].columnDataType.getNewDataType(), null));
    }

    this.tableAPI.appendNewRow();
  }


  getRowsNumber(): number {
    return this.table.length;
  }


  getHeadersCellsAmount(): number {
    return this.headerCells.length;
  }


  getHeadersCells(): HeaderCell[] {
    return this.headerCells;
  }


  insertNewRowAt(rowIndex: number): void {
    if (rowIndex >= 0 && rowIndex < this.getRowsNumber()) {
      this.table.splice(rowIndex, 0, []);

      for (let i: number = 0; i < this.getHeadersCellsAmount(); ++i)
        this.table[rowIndex].push(new Cell(this.headerCells[i].columnDataType.getNewDataType(), null));

      // è necessario perché quando si inserisce una riga le righe al di sotto scendono di 1
      const indexesToUpdate: number[] = [];
      this.selectedRows.forEach(index => {
        if (index >= rowIndex) {
          indexesToUpdate.push(index);
        }
      });

      indexesToUpdate.forEach(index => {
        this.selectedRows.delete(index);
        this.selectedRows.add(index + 1);
      });
    }
  }


  insertNewDataTypeAt(columnIndex: number, dataType: IDataType): void {
    if (columnIndex >= 0 && columnIndex < this.getHeadersCellsAmount()) {
      this.headerCells.splice(columnIndex, 0, new HeaderCell(new TextualDataType(), this.HEADER_CELL_DEFAULT_NAME, dataType));

      for (let i: number = 0; i < this.getRowsNumber(); ++i) {
        this.table[i].splice(columnIndex, 0, new Cell(this.getColumnDataType(columnIndex).getNewDataType(), null));
      }

      // è necessario perché quando si inserisce una colonna le colonne a destra si spostano a destra di 1
      const indexesToUpdate: number[] = [];
      this.selectedColumns.forEach(index => {
        if (index >= columnIndex) {
          indexesToUpdate.push(index);
        }
      });

      indexesToUpdate.forEach(index => {
        this.selectedColumns.delete(index);
        this.selectedColumns.add(index + 1);
      });
    }
  }


  getRows(): Cell[][] {
    return this.table;
  }


  moveColumn(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.getHeadersCellsAmount())
      return;

    if (toIndex < 0 || toIndex >= this.getHeadersCellsAmount())
      return;

    if (fromIndex === toIndex)
      return;

    for (let row of this.table) {
      moveItemInArray(row, fromIndex, toIndex);
    }

    moveItemInArray(this.headerCells, fromIndex, toIndex);

    if (this.isColumnSelected(fromIndex) && !this.isColumnSelected(toIndex)) {
      this.deselectColumn(fromIndex);
      this.selectColumn(toIndex);
    }
    else if (!this.isColumnSelected(fromIndex) && this.isColumnSelected(toIndex)) {
      this.deselectColumn(toIndex);
      this.selectColumn(fromIndex);
    }
  }


  moveRow(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.getRowsNumber())
      return;

    if (toIndex < 0 || toIndex >= this.getRowsNumber())
      return;

    if (fromIndex === toIndex)
      return;

    moveItemInArray(this.table, fromIndex, toIndex);

    if (this.isRowSelected(fromIndex) && !this.isRowSelected(toIndex)) {
      this.deselectRow(fromIndex);
      this.selectRow(toIndex);
    }
    else if (!this.isRowSelected(fromIndex) && this.isRowSelected(toIndex)) {
      this.deselectRow(toIndex);
      this.selectRow(fromIndex);
    }
  }


  moveSelectedRows(fromIndex: number, toIndex: number): void {
    if (!this.hasRowsSelected())
      return;

    let deltaI: number = toIndex - fromIndex;
    let rowsToMove: number[] = [];

    if (deltaI < 0) {
      // ordina le righe selezionate in modo crescente
      rowsToMove = Array.from(this.selectedRows).sort((a, b) => a - b);

      while(rowsToMove[0] + deltaI < 0) // rowsToMove[0] + deltaI corrisponde all'indice in cui finirà la prima riga selezionata
        ++deltaI;
    }
    else if (deltaI > 0) {
      // ordina le righe selezionate in modo decrescente
      rowsToMove = Array.from(this.selectedRows).sort((a, b) => b - a);

      while(rowsToMove[0] + deltaI >= this.getRowsNumber()) // rowsToMove[0] + deltaI corrisponde all'indice in cui finirà l'ultima riga selezionata
        --deltaI;
    }

    if (deltaI === 0)
      return;

    for (let i of rowsToMove)
      this.moveRow(i, i + deltaI);
  }


  moveSelectedColumns(fromIndex: number, toIndex: number): void {
    if (!this.hasColumnsSelected())
      return;

    let deltaI: number = toIndex - fromIndex;
    let columnsToMove: number[] = [];

    if (deltaI < 0) {
      // Ordina le colonne selezionate in ordine crescente
      columnsToMove = Array.from(this.selectedColumns).sort((a, b) => a - b);

      while (columnsToMove[0] + deltaI < 0) // columnsToMove[0] + deltaI corrisponde all'indice in cui finirà la prima colonna selezionata
        ++deltaI;
    }
    else if (deltaI > 0) {
      // Ordina le colonne selezionate in ordine decrescente
      columnsToMove = Array.from(this.selectedColumns).sort((a, b) => b - a);

      while (columnsToMove[0] + deltaI >= this.getHeadersCellsAmount()) // columnsToMove[0] + deltaI corrisponde all'indice in cui finirà l'ultima colonna selezionata
        --deltaI;
    }

    if (deltaI === 0)
      return;

    for (let i of columnsToMove)
      this.moveColumn(i, i + deltaI);
  }


  getColumn(columnIndex: number, limit: number = this.getRowsNumber()): Cell[] {
    if (limit <= 0 || columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return [];

    const column: Cell[] = [];

    for (let i: number = 0; i < Math.min(this.getRowsNumber(), limit); ++i)
      column.push(this.table[i][columnIndex]);

    return column;
  }


  getRow(rowIndex: number, limit: number = this.getHeadersCellsAmount()): Cell[] {
    if (limit <= 0 || rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return [];

    return this.table[rowIndex].slice(0, Math.min(this.getHeadersCellsAmount(), limit));
  }


  getColumnDataType(columnIndex: number): IDataType {
    return this.headerCells[columnIndex].columnDataType;
  }


  selectRow(rowIndex: number): void {
    this.selectedRows.add(rowIndex);
  }


  deselectRow(rowIndex: number): void {
    this.selectedRows.delete(rowIndex);
  }


  selectColumn(columnIndex: number): void {
    this.selectedColumns.add(columnIndex);
  }


  deselectColumn(columnIndex: number): void {
    this.selectedColumns.delete(columnIndex);
  }


  isColumnSelected(columnIndex: number): boolean {
    return this.selectedColumns.has(columnIndex);
  }


  isRowSelected(rowIndex: number): boolean {
    return this.selectedRows.has(rowIndex);
  }


  hasRowsSelected(): boolean {
    return this.selectedRows.size !== 0;
  }


  hasColumnsSelected(): boolean {
    return this.selectedColumns.size !== 0;
  }


  doForEachRowSelected(fn: (rowIndex: number) => void): void {
    this.selectedRows.forEach(fn);
  }


  doForEachColumnSelected(fn: (columnIndex: number) => void): void {
    this.selectedColumns.forEach(fn);
  }


  private getCell(rowIndex: number, columnIndex: number): Cell {
    return this.table[rowIndex][columnIndex];
  }


  private getHeaderCell(columnIndex: number): HeaderCell {
    return this.headerCells[columnIndex];
  }


  deleteRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    this.table.splice(rowIndex, 1);

    if (this.isRowSelected(rowIndex))
      this.deselectRow(rowIndex);

    // è necessario perché quando si cancella una riga le righe al di sotto salgano di 1
    const indexesToUpdate: number[] = [];
    this.selectedRows.forEach(index => {
      if (index > rowIndex) {
        indexesToUpdate.push(index);
      }
    });

    indexesToUpdate.forEach(index => {
      this.selectedRows.delete(index);
      this.selectedRows.add(index - 1);
    });
  }


  deleteSelectedRow(): void {
    const rowsToDelete = Array.from(this.selectedRows).sort((a, b) => b - a);
    for (const rowIndex of rowsToDelete) {
      this.deleteRow(rowIndex);
    }
  }


  deleteColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return;

    this.headerCells.splice(columnIndex, 1);

    for (const row of this.table) {
      row.splice(columnIndex, 1);
    }

    if (this.isColumnSelected(columnIndex))
      this.deselectColumn(columnIndex);

    // è necessario perché quando si cancella una colonna le colonne a destra si spostano a sinistra di 1
    const indexesToUpdate: number[] = [];
    this.selectedColumns.forEach(index => {
      if (index > columnIndex) {
        indexesToUpdate.push(index);
      }
    });

    indexesToUpdate.forEach(index => {
      this.selectedColumns.delete(index);
      this.selectedColumns.add(index - 1);
    });
  }


  deleteSelectedColumn(): void {
    const columnsToDelete = Array.from(this.selectedColumns).sort((a, b) => b - a);
    for (const columnIndex of columnsToDelete) {
      this.deleteColumn(columnIndex);
    }
  }


  // duplica la riga e la inserisce a sotto di rowIndex
  duplicateRow(rowIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowsNumber())
      return;

    const clonedRow: Cell[] = [];

    for (let j: number = 0; j < this.getHeadersCellsAmount(); ++j)
      clonedRow.push(new Cell(this.getColumnDataType(j).getNewDataType(), this.table[rowIndex][j].value));

    this.table.splice(rowIndex + 1, 0, clonedRow);

    // è necessario perché quando si duplica una riga le righe al di sotto scendono di 1
    const indexesToUpdate: number[] = [];
    this.selectedRows.forEach(index => {
      if (index > rowIndex) {
        indexesToUpdate.push(index);
      }
    });

    indexesToUpdate.forEach(index => {
      this.selectedRows.delete(index);
      this.selectedRows.add(index + 1);
    });
  }


  // duplica la colonna e la inserisce a destra di columnIndex
  duplicateColumn(columnIndex: number): void {
    if (columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return;

    this.headerCells.splice(
      columnIndex + 1,
      0,
      new HeaderCell(
        this.getHeaderCell(columnIndex).cellDataType.getNewDataType(),
        this.getHeaderCell(columnIndex).value,
        this.getHeaderCell(columnIndex).columnDataType.getNewDataType()
      )
    );

    for (let i: number = 0; i < this.getRowsNumber(); ++i)
      this.table[i].splice(columnIndex + 1, 0, new Cell(this.getColumnDataType(columnIndex).getNewDataType(), this.table[i][columnIndex].value));

    // è necessario perché quando si duplica una colonna le colonne a destra si spostano a destra di 1
    const indexesToUpdate: number[] = [];
    this.selectedColumns.forEach(index => {
      if (index > columnIndex) {
        indexesToUpdate.push(index);
      }
    });

    indexesToUpdate.forEach(index => {
      this.selectedColumns.delete(index);
      this.selectedColumns.add(index + 1);
    });
  }


  changeColumnDataType(columnIndex: number, newDataType: IDataType): void {
    if (columnIndex < 0 || columnIndex >= this.getHeadersCellsAmount())
      return;

    const currentDataType: IDataType = this.getColumnDataType(columnIndex);

    if (currentDataType instanceof newDataType.constructor)
      return;

    this.headerCells[columnIndex] = new HeaderCell(
      new TextualDataType(), this.HEADER_CELL_DEFAULT_NAME, newDataType.getNewDataType()
    );

    for (let i: number = 0; i < this.getRowsNumber(); ++i) {
      this.table[i][columnIndex] = new Cell(newDataType.getNewDataType(), null);
    }

    this.tableAPI.changeColumnDataType(columnIndex, newDataType.getDataTypeId());
  }


  getCellFromCoords(cord: CellCord): Cell | null {
    if (cord.j < 0 || cord.j >= this.getHeadersCellsAmount())
      return null;

    if (!cord.isHeaderCell && cord.i < 0 || cord.i >= this.getRowsNumber())
      return null;

    return cord.isHeaderCell ?
      this.getHeaderCell(cord.j) :
      this.getCell(cord.i, cord.j);
  }


  setCellValue(cord: CellCord, value: any): void {
    if (value !== null) {
      const cell: Cell | null = this.getCellFromCoords(cord);

      if (cell === null)
        return;

      if (!this.isRowSelected(cord.i) && !this.isColumnSelected(cord.j)) {
        cell.value = value;
        this.tableAPI.updateCellValue(value, cord.i, cord.j);
      }
      else {
        this.doForEachRowSelected((e: number): void => {
          for (let r of this.getRow(e)) {
            if (cell.cellDataType.constructor === r.cellDataType.constructor)
              r.value = value;
          }
        });

        this.doForEachColumnSelected((e: number): void => {
          for (let c of this.getColumn(e))
            c.value = value;
        });
      }
    }
  }


  loadFromTableDTO(tableDTO: TableDTO): void {
    for (let columnDTO of tableDTO.header) {
      this.headerCells.push(
        new HeaderCell(
          new TextualDataType(),
          columnDTO.columnName || this.HEADER_CELL_DEFAULT_NAME,
          this.dataTypeService.convertIntoIDataType(columnDTO.dataType)
        )
      )
    }

    for (let row of tableDTO.content) {
      this.table.push([])

      for (let j: number = 0; j < row.length; ++j) {
        this.table[this.getRowsNumber() - 1].push(new Cell(this.headerCells[j].columnDataType.getNewDataType(), row[j]));
      }
    }
  }


  init(tableId: string): void {
    this.isLoaded = false;
    this.tableAPI.getTable(tableId).subscribe(
      {
        next: tableDTO => { this.loadFromTableDTO(tableDTO); this.isLoaded = true; }
      }
    )
  }


  set isLoaded(value: boolean) {
    this._isLoaded = value;
  }


  get isLoaded(): boolean {
    return this._isLoaded;
  }
}
