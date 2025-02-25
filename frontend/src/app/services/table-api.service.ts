import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TableApiService {

  private httpClient: HttpClient = inject(HttpClient);


  createNewTable(): Observable<void> {
    return this.httpClient.put<void>("/table", {});
  }
}
