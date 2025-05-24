import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
import {BaseInputComponent} from '../base-input-component';
import * as L from 'leaflet';
import {DataTypeRegistryService} from '../../../services/data-type-registry.service';

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

  static readonly lngLatSeparator = ':';
  // template doesn't like static variables
  protected separator = MapInputComponent.lngLatSeparator;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map');
    this.setMapView();

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.map.on('click', this.onMapClick.bind(this));
  }

  private setLongitudeLatitudeOnInput(lat: number, lng: number): void {
    this.latitudeInput().nativeElement.value = lat.toString();
    this.longitudeInput().nativeElement.value = lng.toString();
  }

  private getCurrentLongitudeLatitude(): string {
    return `${this.latitudeInput().nativeElement.value}${MapInputComponent.lngLatSeparator}${this.longitudeInput().nativeElement.value}`;
  }

  private setMapView(lat: number = 51.505, lng: number = -0.09): void {
    this.setLongitudeLatitudeOnInput(lat, lng);
    this.map.setView([lat, lng], 13);
  }

  private locateUser(): void {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by the browser');
      this.setMapView();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        this.setMapView(lat, lng);

        this.currentMarker = L.marker([lat, lng])
          .addTo(this.map)
          .bindPopup('You\'re here!')
          .openPopup();
      },
      err => {
        console.error('Error in position detection:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
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
    if (!this.startingValue)
      this.locateUser();
    else {
      const latLng: string[] = (this.startingValue as string).split(MapInputComponent.lngLatSeparator);
      const lat = Number(latLng[0]) || 0;
      const lng = Number(latLng[1]) || 0;
      this.setMapView(lat, lng);
      this.setMarker(lat, lng);
    }
  }

  private applyInput(): void {
    const coordinateRegex: RegExp = /^(-?\d+(\.\d+)?):(-?\d+(\.\d+)?)$/;
    const cord = this.getCurrentLongitudeLatitude();

    if (cord == MapInputComponent.lngLatSeparator)
      this.confirmInputDataType('', DataTypeRegistryService.MAP_ID);
    else if (cord && coordinateRegex.test(cord))
      this.confirmInputDataType(cord, DataTypeRegistryService.MAP_ID);
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
