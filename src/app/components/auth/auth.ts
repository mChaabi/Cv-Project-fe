import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../../services/utilisateur';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss']
})
export class AuthComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private utilisateurService = inject(UtilisateurService);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  // Signal pour basculer entre Login (true) et Register (false)
  isLoginMode = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Formulaire unique ou partagé
  authForm: FormGroup = this.fb.group({
    username: [''], // Utilisé seulement pour l'inscription
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['RH']    // Utilisé seulement pour l'inscription
  });

  ngOnInit(): void {
    // Registra los idiomas disponibles
    this.translate.addLangs(['fr', 'en', 'ar']);

    let defaultLang = 'fr'; // Idioma por defecto absoluto

    // Solo intentar acceder a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const browserLang = this.translate.getBrowserLang();
      const savedLang = localStorage.getItem('selectedLang');

      if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) {
        defaultLang = savedLang;
      } else if (browserLang && ['fr', 'en', 'ar'].includes(browserLang)) {
        defaultLang = browserLang;
      }
    }

    // Aplica el idioma directamente con .use()
    this.translate.use(defaultLang);
  }

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
      this.utilisateurService.login(formValues.email, formValues.password).subscribe({
        next: (userFound) => {
          localStorage.setItem('currentUser', JSON.stringify({
            id: userFound.id,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role
          }));
          localStorage.setItem('authToken', 'fake-jwt-token-xyz');

          this.isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Email ou mot de passe incorrect.');
        }
      });
    } else {
      this.utilisateurService.create(formValues).subscribe({
        next: () => {
          this.successMessage.set('Compte créé avec succès ! Vous pouvez vous connecter.');
          this.isLoading.set(false);
          this.toggleMode(true);
        },
        error: (err) => {
          this.errorMessage.set("Erreur lors de l'inscription. Vérifie les données.");
          this.isLoading.set(false);
        }
      });
    }
  }
}