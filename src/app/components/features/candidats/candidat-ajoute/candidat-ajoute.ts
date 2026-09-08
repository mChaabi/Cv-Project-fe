import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CandidatService } from '../../../../services/candidat';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-candidat-ajoute',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslatePipe],
  templateUrl: './candidat-ajoute.html',
  styleUrls: ['./candidat-ajoute.scss']
})
export class CandidatAjouteComponent {
  private fb = inject(FormBuilder);
  private candidatService = inject(CandidatService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);

  candidatForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    telephone: ['', [Validators.pattern(/^$|^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)]],
    linkedinUrl: ['', [Validators.pattern(/^$|^https?:\/\/.+$/)]],
    dateNaissance: [null]
  });

  onSubmit(): void {
    if (this.candidatForm.invalid) {
      this.candidatForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.candidatService.create(this.candidatForm.value).subscribe({
      next: () => {
        alert('Inscription réussie !');
        this.isSubmitting.set(false);
        this.candidatForm.reset();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erreur lors de la création', err);
        this.isSubmitting.set(false);
      }
    });
  }
}