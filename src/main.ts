import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // ✅ Ton composant racine
import { appConfig } from './app/app.config'; // ✅ La configuration avec routes, animations...

bootstrapApplication(AppComponent, appConfig)
.catch(err => console.error(err)); 