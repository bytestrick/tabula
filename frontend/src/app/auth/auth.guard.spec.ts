import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';

import {authGuard} from './auth.guard';
import {AuthService} from './auth.service';

describe('authGuard', () => {
  let guard: CanActivateFn;
  let authSateSpy: jasmine.Spy;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve())

    const mockAuthService = jasmine.createSpyObj('AuthService', ['signIn']);
    authSateSpy = jasmine.createSpy('isAuthenticated');
    Object.defineProperty(mockAuthService, 'isAuthenticated', {get: authSateSpy})

    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useValue: mockAuthService},
        {provide: Router, useValue: mockRouter}
      ]
    });
    guard = (...guardParameters) => TestBed.runInInjectionContext(() => authGuard(...guardParameters));
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => expect(guard).toBeTruthy());

  it('should let an authenticated user through', () => {
    authSateSpy.and.returnValue(true);
    const route = {} as ActivatedRouteSnapshot;
    const state = {url: '/'} as RouterStateSnapshot;
    expect(guard(route, state)).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled(); // no redirection takes place
  });

  it('should redirect unauthenticated users to the sign-in page and remember the returnUrl', () => {
    authSateSpy.and.returnValue(false);
    const route = {} as ActivatedRouteSnapshot;
    const state = {url: '/'} as RouterStateSnapshot;
    expect(guard(route, state)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/sign-in'], {queryParams: {returnUrl: '/'}});
  });
});
