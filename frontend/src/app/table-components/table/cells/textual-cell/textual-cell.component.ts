import { Component } from '@angular/core';
import {BaseCellComponent} from '../base-cell-component';

@Component({
  selector: 'tbl-textual-cell',
  standalone: true,
  imports: [],
  templateUrl: './textual-cell.component.html',
  styleUrl: './textual-cell.component.css'
})
export class TextualCellComponent extends BaseCellComponent {}
