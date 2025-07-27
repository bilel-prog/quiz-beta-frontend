import { TestBed } from '@angular/core/testing';

import { UserStorageService } from './user-storage.service';

describe('UserStorage', () => {
  let service: UserStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
