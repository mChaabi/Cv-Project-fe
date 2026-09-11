import { TestBed } from '@angular/core/testing';
import { Transcript } from './transcript';

describe('Transcript', () => {
  let service: Transcript;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Transcript);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
