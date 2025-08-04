import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilderRoutingModule } from './form-builder-routing-module';
import { FormBuilder } from './components/form-builder/form-builder';
import { QuestionEditor } from './components/question-editor/question-editor';
import { FormPreview } from './components/form-preview/form-preview';
import { SectionEditor } from './components/section-editor/section-editor';


@NgModule({
  declarations: [
    FormBuilder,
    QuestionEditor,
    FormPreview,
    SectionEditor
  ],
  imports: [
    CommonModule,
    FormBuilderRoutingModule
  ]
})
export class FormBuilderModule { }
