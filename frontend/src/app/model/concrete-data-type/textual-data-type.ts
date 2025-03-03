import {IDataType} from '../data-type.interface';
import { BaseInputComponent } from '../../components/input-components/base-input-component';
import {Renderer2, Type} from '@angular/core';
import {TextInputComponent} from '../../components/input-components/text-input/text-input.component';
import {BaseCellComponent} from '../../components/table/cells/base-cell-component';
import {TextualCellComponent} from '../../components/table/cells/textual-cell/textual-cell.component';

export class TextualDataType implements IDataType {

  constructor(private renderer: Renderer2) {}


  getInputComponent(): Type<BaseInputComponent> {
    return TextInputComponent;
  }


  getNewDataType(): IDataType {
    throw new Error('Method not implemented.');
  }


  getDataTypeIcon(): HTMLElement {
    const div: HTMLElement = this.renderer.createElement('div');
    const i: HTMLElement = this.renderer.createElement('i');

    this.renderer.addClass(i, "bi");
    this.renderer.addClass(i, "bi-fonts");
    this.renderer.appendChild(div, i);
    this.renderer.appendChild(div, this.renderer.createText('Text'));

    return div;
  }


  getCellComponent(): Type<BaseCellComponent> {
    return TextualCellComponent;
  }
}
