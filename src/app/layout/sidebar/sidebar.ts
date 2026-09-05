import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CandidatService } from '../../services/candidat';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  private candidatService = inject(CandidatService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  totalCandidats = signal<number>(0);

  ngOnInit(): void {
    this.loadBadgeCounts();
  }

  loadBadgeCounts(): void {
    this.candidatService.getAll().subscribe({
      next: (data) => this.totalCandidats.set(data.length),
      error: (err) => console.error('Erreur chargement sidebar', err)
    });
  }

  onLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser'); // ✅ adapte la clé si ton AuthService en utilise une autre
    }
    this.router.navigate(['/login']);
  }
}