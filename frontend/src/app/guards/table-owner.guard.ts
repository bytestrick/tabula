import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {TableApiService} from '../services/table-api.service';
import {catchError, map, of} from 'rxjs';

export const tableOwnerGuard: CanActivateFn = (route, _) => {
  const tableId = route.url[route.url.length - 1].toString();
  const tableApi = inject(TableApiService);
  const router = inject(Router);

  return tableApi.getTable(tableId).pipe(
    map(() => true),
    catchError((_) => {
      router.navigate([`${ tableId }`]).then();
       return of(false);
    })
  );
}
