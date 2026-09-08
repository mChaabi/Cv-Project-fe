import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidatConsult } from './candidat-consult';

describe('CandidatConsult', () => {
  let component: CandidatConsult;
  let fixture: ComponentFixture<CandidatConsult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatConsult],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatConsult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
