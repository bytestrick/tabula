import {Component, inject} from '@angular/core';
import {BaseCellComponent} from '../base-cell-component';
import {MapInputComponent} from '../../../input-components/map-input/map-input.component';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'tbl-textual-cell',
  templateUrl: './map-cell.component.html',
  styleUrl: '../textual-cell/textual-cell.component.css'
})
export class MapCellComponent extends BaseCellComponent {

  httpClient = inject(HttpClient);

  public prettyCord = ''


  override setValue(cord: string): void {
    super.setValue(cord);

    if (!cord) return;

    this.prettyCord = '...'; // shown while waiting for api response

    const splitCord = cord.split(MapInputComponent.lngLatSeparator)
    const lat = splitCord[0] || '0';
    const lng = splitCord[1] || '0';
    const params = {
      lat: lat,
      lon: lng,
      format: 'json',
      addressdetails: '1',
      'accept-language': 'en',
    };
    const url = 'https://nominatim.openstreetmap.org/reverse';

    this.httpClient.get<{ name: string, type: string }>(url, { params }).subscribe(
      value => {
        const name = value.name;
        const type = value.type;

        if (name && type)
          this.prettyCord = `${value.name} (${value.type})`;
        else if (name && !type)
          this.prettyCord = `${value.name}`;
        else if (!name && type)
          this.prettyCord = `location unknown (${value.type})`;
        else
          this.prettyCord = cord;
      },
    )
  }
}
