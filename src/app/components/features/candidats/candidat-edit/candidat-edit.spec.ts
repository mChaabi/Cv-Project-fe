import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidatEdit } from './candidat-edit';

describe('CandidatEdit', () => {
  let component: CandidatEdit;
  let fixture: ComponentFixture<CandidatEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidatEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
