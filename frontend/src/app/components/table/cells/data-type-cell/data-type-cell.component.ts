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

  @Input() iconName: string = '';
  @Input() protected onChangeDataTypeCallback!: (event: MouseEvent, columnIndex: number) => void;


  onChangeDataType(event: MouseEvent): void {
    if (this.cord === null)
      return;

    this.onChangeDataTypeCallback(event, this.cord.second);
  }
}
