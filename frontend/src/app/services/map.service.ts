import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import * as L from 'leaflet';
import { Observable } from "rxjs";

/**
 * Interface representing the “prettified” coordinates returned by the reverse geocoding service.
 * - `name`: A human-readable address (e.g., "Piazza del Duomo, Milan, Italy").
 * - `type`: The type of location (e.g., "residential", "road", etc.).
 */
export interface PrettyCord {
  name: string;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  /** Instance of HttpClient injected via Angular’s `inject` function. */
  private readonly httpClient: HttpClient = inject(HttpClient);

  /**
   * Creates and returns a new Leaflet map initialized on the HTML element with id "map".
   *
   * @param maxZoom - The maximum zoom level for the tile layer (default is 19).
   * @returns An initialized `L.Map` instance.
   */
  getNewMap(maxZoom: number = 19): L.Map {
    // Initialize the map bound to the <div id="map"> element
    const map: L.Map = L.map('map');

    // Add the OpenStreetMap tile layer with attribution and the specified maxZoom
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return map;
  }

  /**
   * Performs a reverse geocoding request to convert latitude & longitude into a human-readable address.
   *
   * @param lat - The latitude coordinate.
   * @param lng - The longitude coordinate.
   * @param language - The desired language for the address (default is 'en').
   * @returns An `Observable<PrettyCord>` that emits the prettified address object.
   */
  getConvertedCords(lat: number, lng: number, language: string = 'en'): Observable<PrettyCord> {
    const params = {
      lat,
      lon: lng,
      format: 'json',
      addressdetails: '1',
      'accept-language': language,
    };
    const url = 'https://nominatim.openstreetmap.org/reverse';
    return this.httpClient.get<PrettyCord>(url, { params });
  }

  /**
   * Attempts to locate the user via the browser’s Geolocation API and center the map on their location.
   *
   * @param map - The Leaflet map instance on which to set the view and show a popup.
   * @returns `true` if Geolocation is supported and the call to getCurrentPosition was initiated; `false` otherwise.
   *
   * @example
   * ```ts
   * const located = this.mapService.locateUser(this.map);
   * if (!located) {
   *   console.warn('Could not start geolocation.');
   * }
   * ```
   */
  locateUser(map: L.Map): boolean {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by the browser');
      return false;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Center the map on the user’s coordinates and display a popup
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
