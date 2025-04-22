import {inject, Injectable} from '@angular/core';
import {IDataType} from '../model/data-types/i-data-type';
import {TextualDataType} from '../model/data-types/concrete-data-type/textual-data-type';
import {NumericDataType} from '../model/data-types/concrete-data-type/numeric-data-type';
import {MonetaryDataType} from '../model/data-types/concrete-data-type/monetary-data-type';
import {map, Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';

export interface DataTypeDTO {
  id: number,
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class DataTypeRegistryService {

  private httpClient: HttpClient = inject(HttpClient);


  getDataType(term: string = ''): Observable<IDataType[]> {
    const params: HttpParams = new HttpParams({ fromObject: {term} });

    return this.httpClient.get<DataTypeDTO[]>("/data-type", { params }).pipe(
      map(dataTypesDTO=> dataTypesDTO.map(
        dataTypeDTO => this.convertIntoIDataType(dataTypeDTO.id)
      ))
    );
  }


  convertIntoIDataType(dataTypeId: number): IDataType {
    switch (dataTypeId) {
      case 1: return new TextualDataType();
      case 2: return new NumericDataType();
      case 3: return new MonetaryDataType();
      default: throw new Error(`${dataTypeId} does not match any data type`);
    }
  }
}
