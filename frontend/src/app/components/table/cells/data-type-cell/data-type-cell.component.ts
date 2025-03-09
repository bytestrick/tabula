import { Component, Input } from '@angular/core';
import {BaseCellComponent} from '../base-cell-component';

@Component({
  selector: 'app-data-type-cell',
  standalone: true,
  imports: [],
  templateUrl: './data-type-cell.component.html',
  styleUrl: './data-type-cell.component.css'
})
export class DataTypeCellComponent extends BaseCellComponent {

  private readonly defaultValue: string = 'New Column';

  override value: any = this.defaultValue;

  @Input() iconName: string = '';


  override setValue(value: any): void {
    if (value === null || value === '')
      this.value = this.defaultValue;
    else
      this.value = value;
  }
}
