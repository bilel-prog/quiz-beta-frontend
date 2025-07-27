import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeTest } from './take-test';

describe('TakeTest', () => {
  let component: TakeTest;
  let fixture: ComponentFixture<TakeTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TakeTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TakeTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
