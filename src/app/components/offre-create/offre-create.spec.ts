import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OffreCreate } from './offre-create';

describe('OffreCreate', () => {
  let component: OffreCreate;
  let fixture: ComponentFixture<OffreCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffreCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(OffreCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
