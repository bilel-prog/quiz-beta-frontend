import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CreateTestComponent } from './components/create-test/create-test.component';
import { AddQuestionInTestComponent } from './components/add-question-in-test/add-question-in-test.component';
import { ViewTestComponent } from './components/view-test-component/view-test-component';
import { ViewTestResults } from './components/view-test-results/view-test-results';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'create-test', component: CreateTestComponent },
  { path: 'add-question/:id', component: AddQuestionInTestComponent },
  { path: 'view-test/:id', component: ViewTestComponent },
  { path: 'view-test-results', component: ViewTestResults },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
