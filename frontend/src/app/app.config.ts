import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {apiInterceptor} from './api.interceptor';
import {authInterceptor} from './auth/auth.interceptor';
import {errorInterceptor} from './error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor, authInterceptor, errorInterceptor]))
  ],
};

/** Regular expression that validates passwords */
export const passRegExp = new RegExp(
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!#$%&"'()*+,\-./:;<=>?@\[\\\]^_`{|}~])[A-Za-z\d!#$%&"'()*+,\-./:;<=>?@\[\\\]^_`{|}~]{10,}$/
);


/** Backend API URL prefix */
export const backendBaseUrl = 'http://localhost:8080/api/v1';
