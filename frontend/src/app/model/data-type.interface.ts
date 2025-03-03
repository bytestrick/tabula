import {BaseInputComponent} from '../components/input-components/base-input-component';
import {Type} from '@angular/core';
import {BaseCellComponent} from '../components/table/cells/base-cell-component';

export interface IDataType {
  getInputComponent(): Type<BaseInputComponent>;
  getNewDataType(): IDataType; // Da togliere se non serve tenere traccia di tutte le celle. Vedi table.ts
  getDataTypeIcon(): HTMLElement; // Ritorna la parte che viene mostrata sulla tabella per far capire che tipo di dato c'è lungo la colonna.
  getCellComponent(): Type<BaseCellComponent>; // Ritorna l'elemento che andrà messo come cella nella tabella.
}
