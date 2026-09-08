import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cv } from '../../models/cv';
import { CvService } from '../../services/cv';
import { TranslatePipe } from '@ngx-translate/core';

interface CandidateGroup {
  candidatId: number;
  candidatNomComplet: string;
  initials: string;
  cvs: Cv[];
}

@Component({
  selector: 'app-cvs',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './cvs.html',
  styleUrls: ['./cvs.scss']
})
export class CVs implements OnInit {
  private cvService = inject(CvService);
  private router = inject(Router);

  cvs = signal<Cv[]>([]);
  isLoading = signal(true);
  selectedCvDetail = signal<Cv | null>(null);

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

  ngOnInit(): void {
    this.loadCvs();
  }

  loadCvs(): void {
    this.isLoading.set(true);
    this.cvService.getAll().subscribe({
      next: (data) => { this.cvs.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  navigateToUpload(): void {
    this.router.navigate(['/cvs/nouveau']); // Route vers le composant d'upload
  }

  openDetailModal(cv: Cv): void {
    this.selectedCvDetail.set(cv);
  }

  closeDetailModal(): void {
    this.selectedCvDetail.set(null);
  }

  getInitials(cv: Cv): string {
    const nom = cv.candidat?.nom ?? '';
    const prenom = cv.candidat?.prenom ?? '';
    return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase() || 'CV';
  }

  getFileUrl(cv: Cv): string {
    return `http://localhost:8080${cv.fichierUrl}`;
  }

  deleteCv(id: number): void {
    if (!confirm('Supprimer ce CV ?')) return;
    this.cvService.delete(id).subscribe(() => {
      this.cvs.update(list => list.filter(c => c.id !== id));
    });
  }
}