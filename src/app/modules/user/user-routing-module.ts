import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { TakeTest } from './components/take-test/take-test';
import { ViewMyTestResults } from './components/view-my-test-results/view-my-test-results';
import { MyTestsComponent } from './components/my-tests/my-tests.component';
import { EditTestComponent } from './components/edit-test/edit-test.component';
import { AddQuestionInTestComponent } from './components/add-question-in-test/add-question-in-test.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'my-tests', component: MyTestsComponent },
  { path: 'edit-test/:id', component: EditTestComponent },
  { path: 'add-question/:testId', component: AddQuestionInTestComponent },
  { path: 'take-test/:id', component: TakeTest },
  { path: 'view-test-results', component: ViewMyTestResults },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
