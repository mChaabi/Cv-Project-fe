import { TestBed } from '@angular/core/testing';
import { OffreEmploi } from './offre-emploi';

describe('OffreEmploi', () => {
  let service: OffreEmploi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OffreEmploi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
