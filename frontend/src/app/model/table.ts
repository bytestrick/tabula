import {IDataType} from './data-type.interface';

export class Table {

  // Se serve tenere traccia di tutti gli elementi dentro la tabella seguire le indicazioni sotto.

  private rowsNumber: number = 0; // da commentare
  //private table: IDataType[][] = []; da scommentare
  private dataTypes: IDataType[] = [];


  addNewDataType(dataType: IDataType): void {
    this.dataTypes.push(dataType);
    //this.updateRow(); da scommentare
  }


  addNewRow(): void {
    ++this.rowsNumber; // da commentare
    // da scommentare
    // const lastRowI: number = this.table.length - 1;
    //
    // for (let i: number = 0; i < this.dataTypes.length; ++i) {
    //   this.table[lastRowI].push(this.dataTypes[i].getNewDataType());
    // }
  }

  // da scommentare
  // private updateRow(): void {
  //   for (let i: number = 0; i < this.getRowSize(); ++i) {
  //     while (this.table[i].length < this.getDataTypesAmount()) {
  //       const currentDataType: IDataType = this.dataTypes[this.table[i].length - 1];
  //       this.table[i].push(currentDataType.getNewDataType())
  //     }
  //   }
  // }


  getRowSize(): number {
    return this.rowsNumber; // da commentare
    //return this.table.length; da scommentare
  }


  getDataTypesAmount(): number {
    return this.dataTypes.length;
  }


  getDataTypes():IDataType[] {
    return this.dataTypes;
  }


  getDataType(i: number): IDataType {
    return this.dataTypes[i];
  }
}
