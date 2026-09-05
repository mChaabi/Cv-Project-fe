import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CandidatsComponent } from './components/candidats/candidats';
import { CandidaturesComponent } from './components/candidatures/candidatures';
import { CompetencesComponent } from './components/competences/competences';
import { CvsComponent } from './components/cvs/cvs';
import { ExperiencesComponent } from './components/experiences/experiences';
import { FormationsComponent } from './components/formations/formations';
import { OffresEmploiComponent } from './components/offres-emploi/offres-emploi';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs';
import { authGuard } from './guards/auth-guard';
import { AuthComponent } from './components/auth/auth';

export const routes: Routes = [

    { path: 'auth', component: AuthComponent },
  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard], // Protège toutes les pages du layout
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'candidats', component: CandidatsComponent },
      { path: 'candidatures', component: CandidaturesComponent },
      { path: 'competences', component: CompetencesComponent },
      { path: 'cvs', component: CvsComponent },
      { path: 'experiences', component: ExperiencesComponent },
      { path: 'formations', component: FormationsComponent },
      { path: 'offres-emploi', component: OffresEmploiComponent },
      { path: 'utilisateurs', component: UtilisateursComponent },
      
      // Redirection par défaut vers le dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Redirection globale si la route n'existe pas
  { path: '**', redirectTo: '' }
];