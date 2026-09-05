import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExperienceService } from '../../services/experience';
import { Experience } from '../../models/experience';

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './experiences.html',
  styleUrls: ['./experiences.scss']
})
export class ExperiencesComponent implements OnInit {
  private experienceService = inject(ExperienceService);
  private fb = inject(FormBuilder);

  experiences = signal<Experience[]>([]);
  isLoading = signal<boolean>(true);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  experienceForm: FormGroup = this.fb.group({
    poste: ['', [Validators.required, Validators.minLength(2)]],
    entreprise: ['', [Validators.required]],
    dateDebut: ['', [Validators.required]],
    dateFin: [null],
    enCours: [false],
    description: ['']
  });

  ngOnInit(): void {
    this.loadExperiences();
  }

  loadExperiences(): void {
    this.isLoading.set(true);
    this.experienceService.getAll().subscribe({
      next: (data) => {
        this.experiences.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  toggleEnCours(): void {
    const isEnCours = this.experienceForm.get('enCours')?.value;
    const dateFinControl = this.experienceForm.get('dateFin');

    if (isEnCours) {
      dateFinControl?.setValue(null);
      dateFinControl?.disable();
    } else {
      dateFinControl?.enable();
    }
  }

  openModal(): void {
    this.experienceForm.reset({ enCours: false });
    this.experienceForm.get('dateFin')?.enable();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.experienceForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.experienceForm.getRawValue();

    const payload: Partial<Experience> = {
      poste: formValue.poste,
      entreprise: formValue.entreprise,
      dateDebut: formValue.dateDebut,
      dateFin: formValue.enCours ? null : formValue.dateFin,
      description: formValue.description
    };

    this.experienceService.create(payload).subscribe({
      next: (newExp) => {
        this.experiences.update(list => [newExp, ...list]);
        this.closeModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      }
    });
  }

  deleteExperience(id: number): void {
    if (confirm('Voulez-vous supprimer cette expérience ?')) {
      this.experienceService.delete(id).subscribe({
        next: () => this.experiences.update(list => list.filter(e => e.id !== id))
      });
    }
  }
}