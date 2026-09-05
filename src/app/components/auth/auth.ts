import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../../services/utilisateur';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss']
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private utilisateurService = inject(UtilisateurService);

  // Signal pour basculer entre Login (true) et Register (false)
  isLoginMode = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Formulaire unique ou partagé
  authForm: FormGroup = this.fb.group({
    username: [''], // Utilisé seulement pour l'inscription
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['RH']    // Utilisé seulement pour l'inscription
  });

  // Méthode pour changer de mode (Connexion <-> Inscription)
  toggleMode(loginMode: boolean): void {
    this.isLoginMode.set(loginMode);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.authForm.reset({ role: 'RH' });

    // Ajuste les validateurs dynamiquement selon le mode
    if (loginMode) {
      this.authForm.get('username')?.clearValidators();
      this.authForm.get('role')?.clearValidators();
    } else {
      this.authForm.get('username')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.authForm.get('role')?.setValidators([Validators.required]);
    }
    this.authForm.get('username')?.updateValueAndValidity();
    this.authForm.get('role')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.authForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValues = this.authForm.value;

    if (this.isLoginMode()) {
      // Logique de Connexion simulée
      setTimeout(() => {
        if (formValues.email && formValues.password) {
          localStorage.setItem('authToken', 'fake-jwt-token-xyz');
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage.set('Identifiants invalides.');
          this.isLoading.set(false);
        }
      }, 1000);
    } else {
      // Logique d'Inscription connectée à ton Backend Spring Boot
      this.utilisateurService.create(formValues).subscribe({
        next: () => {
          this.successMessage.set('Compte créé avec succès ! Vous pouvez vous connecter.');
          this.isLoading.set(false);
          this.toggleMode(true); // Bascule vers le mode login
        },
        error: (err) => {
          console.error(err);
          this.errorMessage.set("Erreur lors de l'inscription. Vérifie les données.");
          this.isLoading.set(false);
        }
      });
    }
  }
}