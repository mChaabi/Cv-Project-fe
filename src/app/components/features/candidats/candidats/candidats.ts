import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CandidatService } from '../../../../services/candidat';
import { Candidat } from '../../../../models/candidat';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchService } from '../../../../services/search';
import { InterviewScoreService } from '../../../../services/interview-score';
import { catchError, of, single } from 'rxjs';
import { TranscriptEntry, TranscriptService } from '../../../../services/transcript';
import { TranscriptViewComponent } from '../../../transcript/transcript';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, TranslatePipe,TranscriptViewComponent],
  templateUrl: './candidats.html',
  styleUrls: ['./candidats.scss']
})
export class CandidatsComponent implements OnInit {
  private candidatService = inject(CandidatService);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private scoreService = inject(InterviewScoreService);
  private transcriptService = inject(TranscriptService);

  candidats = signal<Candidat[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  searchQuery = signal<string>('');
  // ── NOUVEAU : état de la modale transcript ──
showTranscriptModal = signal<boolean>(false);

  interviewScores = signal<Record<number, number | null>>({});
    // ── NOUVEAU : état de la modale transcript ──
  selectedTranscript = signal<TranscriptEntry[]>([]);
  transcriptLoading = signal<boolean>(false);

  // Paramètres de pagination
  currentPage = signal<number>(1);
  pageSize = 5; // Nombre d'éléments par page (modifiable selon vos besoins)

  // Calcul dynamique des pages totales
  totalPages = computed(() => {
    return Math.ceil(this.candidats().length / this.pageSize) || 1;
  });

  // Tableau pour générer les boutons de numéros de page
  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Extraction uniquement des éléments de la page active
  paginatedCandidats = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.candidats().slice(start, end);
  });

  ngOnInit(): void {
    this.loadCandidats();
  }

  loadCandidats(): void {
    this.isLoading.set(true);
    this.candidatService.getAll().subscribe({
      next: (data) => {
        this.candidats.set(data);
        this.isLoading.set(false);
        this.currentPage.set(1); // Reset à la 1ère page
        this.loadInterviewScores(data);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Erreur lors du chargement des candidats.');
        this.isLoading.set(false);
      }
    });
  }

  // ── NOUVEAU : récupère le score de chaque candidat ──
  private loadInterviewScores(candidats: Candidat[]): void {
    candidats.forEach(c => {
      if (!c.id) return;
      this.scoreService.getScore(c.id).pipe(
        catchError(() => of({ interviewScore: null, presenceScore: 100, feedback: '' }))
      ).subscribe(report => {
        this.interviewScores.update(map => ({ ...map, [c.id!]: report.interviewScore }));
      });
    });
  }

  // ── Aide pour le template : couleur du badge selon le score ──
  getScoreClass(score: number | null): string {
    if (score === null) return 'score-none';
    if (score >= 70) return 'score-good';
    if (score >= 40) return 'score-medium';
    return 'score-bad';
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.currentPage.set(1); // Retour à la première page lors d'une recherche

    if (query.trim().length > 0) {
      this.candidatService.search(query).subscribe({
        next: (data) => this.candidats.set(data)
      });
    } else {
      this.loadCandidats();
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  viewCandidat(id: number): void {
    // Redirige vers la page de détails (adaptez la route selon votre projet)
    this.router.navigate(['/candidats/details', id]);
  }

  editCandidat(id: number): void {
    // Redirige vers la page d'édition (adaptez la route selon votre projet)
    this.router.navigate(['/candidats/edit', id]);
  }

  // Filtrage automatique par nom, prénom ou email selon ce qu'on tape dans la Navbar
  filteredCandidats = computed(() => {
    const query = this.searchService.searchTerm().toLowerCase();
    const currentList = this.candidats();

    if (!query) return currentList;

    return currentList.filter(candidat =>
      (candidat.nom && candidat.nom.toLowerCase().includes(query)) ||
      (candidat.prenom && candidat.prenom.toLowerCase().includes(query)) ||
      (candidat.email && candidat.email.toLowerCase().includes(query))
    );
  });

// ── NOUVEAU : ouvrir la modale et charger les données ──
viewTranscript(candidatId: number): void {
  this.showTranscriptModal.set(true);   // ouvre la modale immédiatement
  this.transcriptLoading.set(true);     // affiche le spinner
  this.transcriptService.getTranscript(candidatId).subscribe({
    next: (res) => {
      this.selectedTranscript.set(res.transcript);
      this.transcriptLoading.set(false);
    },
    error: () => {
      this.selectedTranscript.set([]);
      this.transcriptLoading.set(false);
    }
  });
}
  
// ── NOUVEAU : fermer la modale ──
closeTranscript(): void {
  this.showTranscriptModal.set(false);
  this.selectedTranscript.set([]);
  this.transcriptLoading.set(false);
}

  deleteCandidat(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce candidat ?')) {
      this.candidatService.delete(id).subscribe({
        next: () => {
          this.candidats.update(list => list.filter(c => c.id !== id));
          // S'assurer de ne pas rester sur une page vide si on supprime le dernier élément
          if (this.paginatedCandidats().length === 0 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
          }
        }
      });
    }
  }
}