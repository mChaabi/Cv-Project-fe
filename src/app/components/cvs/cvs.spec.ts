import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cvs } from './cvs';

describe('Cvs', () => {
  let component: Cvs;
  let fixture: ComponentFixture<Cvs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cvs],
    }).compileComponents();

    fixture = TestBed.createComponent(Cvs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
