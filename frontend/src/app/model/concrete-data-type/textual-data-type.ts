import {IDataType} from '../data-type.interface';
import { IInputComponent } from '../input-component.interface';
import {Renderer2, Type} from '@angular/core';
import {TextInputComponent} from '../../components/text-input/text-input.component';

export class TextualDataType implements IDataType {

  constructor(private renderer: Renderer2) {}


  getInputComponent(): Type<IInputComponent> {
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


  getDataTypeHTML(): HTMLElement {
    const div: HTMLElement = this.renderer.createElement('div');

    this.renderer.appendChild(div, this.renderer.createText('data'));

    return div;
  }
}
