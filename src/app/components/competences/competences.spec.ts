import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Competences } from './competences';

describe('Competences', () => {
  let component: Competences;
  let fixture: ComponentFixture<Competences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Competences],
    }).compileComponents();

    fixture = TestBed.createComponent(Competences);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
