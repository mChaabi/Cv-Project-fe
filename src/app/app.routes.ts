import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout/layout';
import { DashboardComponent } from './components/dashboard/dashboard';
import { CandidatsComponent } from './components/features/candidats/candidats/candidats';
import { CandidaturesComponent } from './components/candidatures/candidatures';
import { CompetencesComponent } from './components/competences/competences';
import { CVs } from './components/cvs/cvs';
import { ExperiencesComponent } from './components/experiences/experiences';
import { FormationsComponent } from './components/formations/formations';
import { OffresEmploiComponent } from './components/offres-emploi/offres-emploi';
import { UtilisateursComponent } from './components/utilisateurs/utilisateurs';
import { authGuard } from './guards/auth-guard';
import { AuthComponent } from './components/auth/auth';
import { CandidatAjouteComponent } from './components/features/candidats/candidat-ajoute/candidat-ajoute';
import { CvUploadComponent } from './components/cv-upload/cv-upload';
import { OffreCreateComponent } from './components/offre-create/offre-create';
import { InterviewListComponent } from './components/interview-list/interview-list';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth', pathMatch: 'full' },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'candidats', component: CandidatsComponent },
      { path: 'candidats/nouveau', component: CandidatAjouteComponent },

      // Rutas corregidas con las rutas relativas exactas hacia 'features/candidats'
      {
        path: 'candidats/details/:id',
        loadComponent: () => import('./components/features/candidats/candidat-consult/candidat-consult').then(m => m.CandidatConsultComponent)
      },
      {
        path: 'candidats/edit/:id',
        loadComponent: () => import('./components/features/candidats/candidat-edit/candidat-edit').then(m => m.CandidatEditComponent)
      },

      { path: 'candidatures', component: CandidaturesComponent },
      { path: 'competences', component: CompetencesComponent },
      { path: 'cvs', component: CVs },
      { path: 'cvs/nouveau', component: CvUploadComponent },
      { path: 'experiences', component: ExperiencesComponent },
      { path: 'formations', component: FormationsComponent },
      { path: 'offres-emploi', component: OffresEmploiComponent },
      { path: 'offres/nouvelle', component: OffreCreateComponent },
      { path: 'utilisateurs', component: UtilisateursComponent },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'entretiens',
        loadComponent: () => import('./components/interview-list/interview-list').then(m => m.InterviewListComponent)
      }
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];