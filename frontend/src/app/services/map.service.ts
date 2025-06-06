import { HttpClient } from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import * as L from 'leaflet';
import { Observable } from "rxjs";

export interface PrettyCord { name: string, type: string }

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly httpClient: HttpClient = inject(HttpClient);


  getNewMap(maxZoom: number = 19): L.Map {
    let map: L.Map = L.map('map');

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return map;
  }

  getConvertedCords(lat: number, lng: number, language: string = 'en'): Observable<PrettyCord> {
    const params = {
      lat,
      lon: lng,
      format: 'json',
      addressdetails: '1',
      'accept-language': language,
    };
    const url = 'https://nominatim.openstreetmap.org/reverse';
    return this.httpClient.get<PrettyCord>(url, { params })
  }

  locateUser(map: L.Map): boolean {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by the browser');
      return false;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        map.setView([lat, lng], 13);
        L.popup()
          .setLatLng([lat, lng])
          .setContent('You\'re here!')
          .openOn(map);

        return true;
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

    return false;
  }
}
