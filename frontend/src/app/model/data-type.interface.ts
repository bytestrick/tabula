import {IInputComponent} from './input-component.interface';
import {Type} from '@angular/core';

export interface IDataType {
  getInputComponent(): Type<IInputComponent>;
  getNewDataType(): IDataType; // Da togliere se non serve tenere traccia di tutte le celle. Vedi table.ts
  getDataTypeIcon(): HTMLElement; // Ritorna la parte che viene mostrata sulla tabella per far capire che tipo di dato c'è lungo la colonna.
  getDataTypeHTML(): HTMLElement; // Ritorna l'elemento che andrà messo come cella nella tabella.
}
