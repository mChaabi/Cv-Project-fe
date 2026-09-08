import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OffreEmploiService } from '../../services/offre-emploi';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-offre-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './offre-create.html',
  styleUrls: ['./offre-create.scss']
})
export class OffreCreateComponent {
  private fb = inject(FormBuilder);
  private offreService = inject(OffreEmploiService);
  private router = inject(Router);

  isSubmitting = signal<boolean>(false);

  offreForm: FormGroup = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    departement: ['', [Validators.required]],
    typeContrat: ['CDI', [Validators.required]], // <-- Añadir este campo con un valor por défaut
    statut: ['OUVERTE', [Validators.required]]
  });

  onSubmit(): void {
    if (this.offreForm.invalid) {
      this.offreForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.offreService.create(this.offreForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/offres']); // Redirection vers la liste
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
        alert('Erreur lors de la création de l\'offre.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/offres']);
  }
}