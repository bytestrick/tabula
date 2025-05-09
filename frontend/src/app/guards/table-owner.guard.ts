import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {HomeService} from '../home/home.service';
import {catchError, of} from 'rxjs';


// TODO: valutare se implementarla
export const tableOwnerGuard: CanActivateFn = (route, _) => {
  // const tableId: string = route.paramMap.get('table-id') || '';
  // const router: Router = inject(Router);
  //
  // return inject(HomeService).currentUserHasTable(tableId).pipe(
  //   catchError(() =>
  //     of(router.createUrlTree([`/tables/${tableId}`]))
  //   )
  // );
  return true;
}
