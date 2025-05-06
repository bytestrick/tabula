import {inject, Injectable} from '@angular/core';
import {IDataType} from '../model/data-types/i-data-type';
import {TextualDataType} from '../model/data-types/concrete-data-type/textual-data-type';
import {NumericDataType} from '../model/data-types/concrete-data-type/numeric-data-type';
import {MonetaryDataType} from '../model/data-types/concrete-data-type/monetary-data-type';
import {map, Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DataTypeDTO} from '../model/dto/table/data-type-dto';

@Injectable({
  providedIn: 'root'
})
export class DataTypeRegistryService {

  private httpClient: HttpClient = inject(HttpClient);

  public static readonly TEXTUAL_ID: number = 1;
  public static readonly NUMERIC_ID: number = 2;
  public static readonly MONETARY_ID: number = 3;


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
      case DataTypeRegistryService.TEXTUAL_ID: return new TextualDataType();
      case DataTypeRegistryService.NUMERIC_ID: return new NumericDataType();
      case DataTypeRegistryService.MONETARY_ID: return new MonetaryDataType();
      default: throw new Error(`${dataTypeId} does not match any data type`);
    }
  }
}
