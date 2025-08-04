import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNzI18n, en_US } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import { 
  LoginOutline, 
  PlayCircleOutline, 
  ReloadOutline,
  BookOutline,
  QuestionCircleOutline,
  CheckCircleOutline,
  PercentageOutline,
  TableOutline,
  PlusOutline,
  DeleteOutline,
  EditOutline,
  EyeOutline
} from '@ant-design/icons-angular/icons';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';

// Register English locale data
registerLocaleData(en);

const icons: IconDefinition[] = [
  LoginOutline, 
  PlayCircleOutline, 
  ReloadOutline,
  BookOutline,
  QuestionCircleOutline,
  CheckCircleOutline,
  PercentageOutline,
  TableOutline,
  PlusOutline,
  DeleteOutline,
  EditOutline,
  EyeOutline
];

export const appConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideAnimations(),
    provideNzI18n(en_US), // Configure ng-zorro to use English
    provideNzIcons(icons), // Configure icons
  ]
};