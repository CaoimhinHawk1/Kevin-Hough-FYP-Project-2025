// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
// Import AngularFireModule and AngularFireAuthModule
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { environment } from '../environment/environment';
import { routes } from './app.routes';
import { AuthInitializationEffect } from '../effects/auth-init.effect';

// Factory function to initialize auth effect
export function initializeAuthEffect(authEffect: AuthInitializationEffect) {
  return () => {
    console.log('Initializing auth effect');
    // The constructor is enough to set up the listeners
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule
    ),
    // This is important for AngularFire compat
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    // You can keep these if you're using the modular API as well
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    // Initialize auth effect early
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthEffect,
      deps: [AuthInitializationEffect],
      multi: true
    }
  ]
};
