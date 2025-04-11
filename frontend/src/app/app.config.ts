import { ApplicationConfig } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { environment } from '../environment/environment';
import { routes } from './app.routes';
import {HttpHandler} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([
      // Angular 17+ way to provide interceptors
      (req, next) => {
        const authInterceptor = new AuthInterceptor(null as any, null as any);
        // @ts-ignore
        return authInterceptor.intercept(req, next);
      }
    ])),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    // Provide the compat Auth for legacy code
    {
      provide: FIREBASE_OPTIONS,
      useValue: environment.firebase
    },
    // Legacy way for DI in the interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
