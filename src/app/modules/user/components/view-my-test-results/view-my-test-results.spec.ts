import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMyTestResults } from './view-my-test-results';

describe('ViewMyTestResults', () => {
  let component: ViewMyTestResults;
  let fixture: ComponentFixture<ViewMyTestResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewMyTestResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewMyTestResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
