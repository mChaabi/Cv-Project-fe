import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CandidatService } from '../../services/candidat';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule ,TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  private candidatService = inject(CandidatService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  totalCandidats = signal<number>(0);
  userRole: string = 'ADMIN'; // Valeur par défaut pour tout afficher
  isCollapsed = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          // Recherche du rôle dans différentes propriétés possibles
          const rawRole = user.role || user.userRole || user.type || localStorage.getItem('userRole');
          if (rawRole) {
            this.userRole = rawRole.toUpperCase();
          }
        }
      } catch (e) {
        console.error('Erreur lors de la lecture du rôle utilisateur', e);
      }
    }

    if (this.userRole === 'ADMIN' || this.userRole === 'RH') {
      this.loadBadgeCounts();
    }
  }

  loadBadgeCounts(): void {
    this.candidatService.getAll().subscribe({
      next: (data) => this.totalCandidats.set(data.length),
      error: (err) => console.error('Erreur chargement sidebar', err)
    });
  }

  onLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
    }
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
  this.isCollapsed.update(value => !value);
}
}