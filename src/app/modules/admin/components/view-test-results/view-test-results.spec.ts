import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTestResults } from './view-test-results';

describe('ViewTestResults', () => {
  let component: ViewTestResults;
  let fixture: ComponentFixture<ViewTestResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewTestResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTestResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
