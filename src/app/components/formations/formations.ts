import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormationService } from '../../services/formation';
import { Formation } from '../../models/formation';

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formations.html',
  styleUrls: ['./formations.scss']
})
export class FormationsComponent implements OnInit {
  private formationService = inject(FormationService);
  private fb = inject(FormBuilder);

  formations = signal<Formation[]>([]);
  isLoading = signal<boolean>(true);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  currentYear = new Date().getFullYear();

  formationForm: FormGroup = this.fb.group({
    diplome: ['', [Validators.required, Validators.minLength(2)]],
    etablissement: ['', [Validators.required, Validators.minLength(2)]],
    anneeObtention: [null, [Validators.min(1950), Validators.max(this.currentYear + 5)]]
  });

  ngOnInit(): void {
    this.loadFormations();
  }

  loadFormations(): void {
    this.isLoading.set(true);
    this.formationService.getAll().subscribe({
      next: (data) => {
        this.formations.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  openModal(): void {
    this.formationForm.reset();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.formationForm.invalid) return;

    this.isSubmitting.set(true);
    const payload: Partial<Formation> = this.formationForm.value;

    this.formationService.create(payload).subscribe({
      next: (newFormation) => {
        this.formations.update(list => [newFormation, ...list]);
        this.closeModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      }
    });
  }

  deleteFormation(id: number): void {
    if (confirm('Voulez-vous supprimer cette formation ?')) {
      this.formationService.delete(id).subscribe({
        next: () => this.formations.update(list => list.filter(f => f.id !== id))
      });
    }
  }
}