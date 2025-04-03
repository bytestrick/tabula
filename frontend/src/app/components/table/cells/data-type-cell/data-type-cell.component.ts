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

  override value: string | null = null;

  @Input() iconName: string = '';
}
