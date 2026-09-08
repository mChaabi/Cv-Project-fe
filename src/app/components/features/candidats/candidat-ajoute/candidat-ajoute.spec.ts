import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidatAjoute } from './candidat-ajoute';

describe('CandidatAjoute', () => {
  let component: CandidatAjoute;
  let fixture: ComponentFixture<CandidatAjoute>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatAjoute],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatAjoute);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
