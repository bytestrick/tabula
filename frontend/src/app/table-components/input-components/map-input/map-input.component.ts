import {AfterViewInit, Component, ElementRef, inject, viewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import * as L from 'leaflet';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';
import {MapService} from '../../../services/map.service';

@Component({
  selector: 'tbl-map-input',
  imports: [],
  templateUrl: './map-input.component.html',
})
export class MapInputComponent extends BaseInputComponent implements AfterViewInit {
  private map!: L.Map;
  private currentMarker?: L.Marker;
  private latitudeInput = viewChild.required<ElementRef<HTMLInputElement>>('latitudeInput');
  private longitudeInput = viewChild.required<ElementRef<HTMLInputElement>>('longitudeInput');
  private mapService = inject(MapService);

  static readonly SEPARATOR = ':';
  readonly separator = MapInputComponent.SEPARATOR; // for template


  ngAfterViewInit(): void {
    this.map = this.mapService.getNewMap();
    this.map.on('click', this.onMapClick.bind(this));
  }

  private setLongitudeLatitudeOnInput(lat: number, lng: number): void {
    this.latitudeInput().nativeElement.value = lat.toString();
    this.longitudeInput().nativeElement.value = lng.toString();
  }

  private setMapView(lat: number = 51.505, lng: number = -0.09): void {
    this.setLongitudeLatitudeOnInput(lat, lng);
    this.map.setView([lat, lng], 13);
  }

  private setMarker(lat: number, lng: number): void {
    if (this.currentMarker)
      this.map.removeLayer(this.currentMarker);

    this.currentMarker = L.marker([lat, lng])
      .addTo(this.map);
    this.setLongitudeLatitudeOnInput(lat, lng);
  }

  private onMapClick(e:  L.LeafletMouseEvent): void {
    this.setMarker(e.latlng.lat, e.latlng.lng);
  }

  protected override onPopUpShowUp(): void {
    if (!this.startingValue) {
      if (!this.mapService.locateUser(this.map))
        this.setMapView(); // set default view
    }
    else {
      const latLng: string[] = (this.startingValue as string).split(this.separator);
      const lat = Number(latLng[0]) || 0;
      const lng = Number(latLng[1]) || 0;
      this.setMapView(lat, lng);
      this.setMarker(lat, lng);
    }
  }

  private applyInput(): void {
    const coordinateRegex: RegExp = /^(-?\d+(\.\d+)?)$/;
    const lat = Number(this.latitudeInput().nativeElement.value);
    const lng = Number(this.longitudeInput().nativeElement.value);

    if (!lat || !lng) {
      this.abortInput();
      return;
    }

    const latS = String(lat);
    const lngS = String(lng);

    if (coordinateRegex.test(latS) && coordinateRegex.test(lngS)) {
      this.mapService.getConvertedCords(lat, lng).subscribe(
        value => {
          const name = value.name;
          const type = value.type;
          let prettyCord: string;

          if (name && type)
            prettyCord = `${ value.name } (${ value.type })`;
          else if (name && !type)
            prettyCord = `${ value.name }`;
          else if (!name && type)
            prettyCord = `location unknown (${ value.type })`;
          else
            prettyCord = 'location unknown (unknown)';

          const cord = `${latS}${this.separator}${lngS}${this.separator}${prettyCord}`;
          this.confirmInputDataType(cord, DataTypeRegistryService.MAP_ID);
        }
      );
    }
    else
      this.abortInput();
  }

  protected override onPopUpHiddenWithLeftClick(): void {
    this.applyInput();
  }

  protected override onPopUpHiddenWithRightClick(): void {
    this.abortInput();
  }

  onPositionConfirmed(): void {
    this.applyInput();
  }

  onLatitudeLongitudeChange(lat: string, lng: string): void {
    const _lat = Number(lat);
    const _lng = Number(lng);

    if (_lat && _lng)
      this.setMapView(_lat, _lng);
  }
}
