import { TestBed } from '@angular/core/testing';
import { InterviewScore } from './interview-score';

describe('InterviewScore', () => {
  let service: InterviewScore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterviewScore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
