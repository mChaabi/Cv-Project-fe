import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cv } from '../../models/cv';
import { CvService } from '../../services/cv';
import { TranslatePipe } from '@ngx-translate/core';

// ── NOUVEAU : imports pour le transcript ──
import { TranscriptService, TranscriptEntry } from '../../services/transcript';
import { TranscriptViewComponent } from '../transcript/transcript';

interface CandidateGroup {
  candidatId: number;
  candidatNomComplet: string;
  initials: string;
  cvs: Cv[];
}

@Component({
  selector: 'app-cvs',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranscriptViewComponent], // ← ajouté
  templateUrl: './cvs.html',
  styleUrls: ['./cvs.scss']
})
export class CVs implements OnInit {
  private cvService = inject(CvService);
  private router = inject(Router);

  // ── NOUVEAU : service transcript ──
  private transcriptService = inject(TranscriptService);

  cvs = signal<Cv[]>([]);
  isLoading = signal(true);
  selectedCvDetail = signal<Cv | null>(null);

  // ── NOUVEAU : état transcript + score pour la modale ──
  selectedTranscript = signal<TranscriptEntry[]>([]);
  transcriptLoading = signal<boolean>(false);
  interviewScore = signal<number | null>(null);

  // Parámetros de paginación (por ejemplo, 3 grupos de candidatos por página)
  currentPage = signal<number>(1);
  pageSize = 3;

  groupedCvs = computed<CandidateGroup[]>(() => {
    const map = new Map<number, CandidateGroup>();
    for (const cv of this.cvs()) {
      const candidatId = cv.candidat?.id ?? (cv as any).candidatId;
      const nomComplet = cv.candidat?.nom && cv.candidat?.prenom
        ? `${cv.candidat.prenom} ${cv.candidat.nom}`
        : (cv.candidatNomComplet ?? 'Candidat Inconnu');

      if (candidatId && !map.has(candidatId)) {
        const initials = nomComplet
          .split(' ')
          .map(w => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) ?? 'CV';

        map.set(candidatId, {
          candidatId: candidatId,
          candidatNomComplet: nomComplet,
          initials,
          cvs: []
        });
      }

      if (candidatId) {
        map.get(candidatId)!.cvs.push(cv);
      }
    }
    return Array.from(map.values());
  });

  // Calcul dynamique des pages totales pour les groupes
  totalPages = computed(() => {
    return Math.ceil(this.groupedCvs().length / this.pageSize) || 1;
  });

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Extraction uniquement des groupes de la page active
  paginatedGroupedCvs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.groupedCvs().slice(start, end);
  });

  ngOnInit(): void {
    this.loadCvs();
  }

  loadCvs(): void {
    this.isLoading.set(true);
    this.cvService.getAll().subscribe({
      next: (data) => {
        this.cvs.set(data);
        this.isLoading.set(false);
        this.currentPage.set(1);
      },
      error: () => this.isLoading.set(false)
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  navigateToUpload(): void {
    this.router.navigate(['/cvs/nouveau']); // Route vers le composant d'upload
  }

  // ── MODIFIÉ : on charge le transcript + le score en ouvrant la modale ──
  openDetailModal(cv: Cv): void {
    this.selectedCvDetail.set(cv);

    const candidatId = cv.candidat?.id ?? (cv as any).candidatId;
    if (!candidatId) {
      this.selectedTranscript.set([]);
      this.interviewScore.set(null);
      return;
    }

    this.transcriptLoading.set(true);
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

    // ── NOUVEAU : récupère aussi le score d'entretien ──
    this.transcriptService.getScore(candidatId).subscribe({
      next: (res) => this.interviewScore.set(res.interviewScore ?? null),
      error: () => this.interviewScore.set(null)
    });
  }

  // ── MODIFIÉ : on nettoie le transcript et le score en fermant ──
  closeDetailModal(): void {
    this.selectedCvDetail.set(null);
    this.selectedTranscript.set([]);
    this.interviewScore.set(null);
  }

  getInitials(cv: Cv): string {
    const nom = cv.candidat?.nom ?? '';
    const prenom = cv.candidat?.prenom ?? '';
    return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || 'CV';
  }

  getFileUrl(cv: Cv): string {
    return `http://localhost:8080${cv.fichierUrl}`;
  }

  // ── NOUVEAU : couleur du badge selon le score ──
  getScoreClass(score: number | null): string {
    if (score === null) return 'score-none';
    if (score >= 70) return 'score-good';
    if (score >= 40) return 'score-medium';
    return 'score-bad';
  }

  deleteCv(id: number): void {
    if (!confirm('Supprimer ce CV ?')) return;
    this.cvService.delete(id).subscribe(() => {
      this.cvs.update(list => list.filter(c => c.id !== id));
      if (this.paginatedGroupedCvs().length === 0 && this.currentPage() > 1) {
        this.currentPage.update(p => p - 1);
      }
    });
  }

  // 🚀 FONCTION AJOUTÉE POUR CORRIGER L'ERREUR DU BOUTON HTML
  irAEntrevista(cv: Cv): void {
    const candidatId = cv.candidat?.id ?? (cv as any).candidatId;
    const poste = cv.titre ?? '';
    const url = `http://localhost:4201/start?candidatId=${candidatId}&poste=${encodeURIComponent(poste)}`;
    window.location.href = url;
  }
}