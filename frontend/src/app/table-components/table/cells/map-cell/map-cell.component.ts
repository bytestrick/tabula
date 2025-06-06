import {Component} from '@angular/core';
import {BaseCellComponent} from '../base-cell-component';
import {MapInputComponent} from '../../../input-components/map-input/map-input.component';

@Component({
  selector: 'tbl-textual-cell',
  templateUrl: './map-cell.component.html',
  styleUrl: '../textual-cell/textual-cell.component.css'
})
export class MapCellComponent extends BaseCellComponent {
  public prettyCord = ''


  override setValue(cord: string): void {
    super.setValue(cord);
    const splitCord = cord.split(MapInputComponent.SEPARATOR);
    this.prettyCord = splitCord[splitCord.length - 1];
  }
}
