import { Component } from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import {TextualDataType} from '../../../model/concrete-data-type/textual-data-type';

@Component({
  selector: 'app-data-types-chooser',
  standalone: true,
  imports: [],
  templateUrl: './data-types-chooser.component.html',
  styleUrl: './data-types-chooser.component.css'
})
export class DataTypesChooserComponent extends BaseInputComponent {

  protected override beforeShowUp(): void {}


  override grabFocus(): void {}


  onNumeric(): void {
    this.inputConfirmed?.emit();
  }


  onTextual(): void {
    this.inputConfirmed?.emit(TextualDataType);
  }
}
