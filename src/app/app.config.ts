import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations'; // ✅ ADD THIS

export const appConfig = {
providers: [
provideHttpClient(),
provideRouter(routes),
provideAnimations(),

]
};