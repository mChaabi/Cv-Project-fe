import { TestBed } from '@angular/core/testing';
import { InterviewReport } from './interview-report';

describe('InterviewReport', () => {
  let service: InterviewReport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterviewReport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
