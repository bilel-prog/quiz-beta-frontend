import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNzI18n, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

// Register English locale data
registerLocaleData(en);

export const appConfig = {
providers: [
provideHttpClient(),
provideRouter(routes),
provideAnimations(),
provideNzI18n(en_US), // Configure ng-zorro to use English
]
};