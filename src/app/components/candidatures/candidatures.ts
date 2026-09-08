import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CandidatureService } from '../../services/candidature';
import { CandidatService } from '../../services/candidat';
import { OffreEmploiService } from '../../services/offre-emploi';
import { CvService } from '../../services/cv';
import { Candidature, StatutCandidature } from '../../models/candidature';
import { Candidat } from '../../models/candidat';
import { OffreEmploi } from '../../models/offre-emploi';
import { Cv } from '../../models/cv';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-candidatures',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './candidatures.html',
  styleUrls: ['./candidatures.scss']
})
export class CandidaturesComponent implements OnInit {
  private candidatureService = inject(CandidatureService);
  private candidatService = inject(CandidatService);
  private offreService = inject(OffreEmploiService);
  private cvService = inject(CvService);
  private fb = inject(FormBuilder);

  candidatures = signal<Candidature[]>([]);
  candidats = signal<Candidat[]>([]);
  offres = signal<OffreEmploi[]>([]);
  cvsCandidat = signal<Cv[]>([]);

  isLoading = signal<boolean>(true);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  filterStatut = signal<string>('ALL');


  // Parámetros de paginación (por ejemplo, 5 elementos por página)
  currentPage = signal<number>(1);
  pageSize = 5;
  statutsList: StatutCandidature[] = ['RECUE', 'PRESELECTIONNEE', 'ENTRETIEN', 'ACCEPTEE', 'REFUSEE'];


  // Cálculos reactivos para la paginación
  totalPages = computed(() => {
    return Math.ceil(this.candidatures().length / this.pageSize) || 1;
  });

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  paginatedCandidatures = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.candidatures().slice(start, end);
  });
  candidatureForm: FormGroup = this.fb.group({
    candidatId: ['', [Validators.required]],
    offreId: ['', [Validators.required]],
    cvId: ['', [Validators.required]],
    statut: ['RECUE' as StatutCandidature, [Validators.required]],
    commentaireRH: ['']
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading.set(true);
    this.candidatureService.getAll().subscribe({
      next: (data) => {
        this.candidatures.set(data);
        this.isLoading.set(false);
        this.currentPage.set(1);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });

    this.candidatService.getAll().subscribe({
      next: (data) => this.candidats.set(data)
    });

    this.offreService.getAll().subscribe({
      next: (data) => this.offres.set(data)
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

  onCandidatChange(event: Event): void {
    const candidatId = Number((event.target as HTMLSelectElement).value);
    if (candidatId) {
      this.cvService.getByCandidatId(candidatId).subscribe({
        next: (cvs) => this.cvsCandidat.set(cvs)
      });
    } else {
      this.cvsCandidat.set([]);
    }
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      RECUE: 'candidatures.statutRecue',
      PRESELECTIONNEE: 'candidatures.statutPreselectionnee',
      ENTRETIEN: 'candidatures.statutEntretien',
      ACCEPTEE: 'candidatures.statutAcceptee',
      REFUSEE: 'candidatures.statutRefusee'
    };
    return map[statut] ?? statut;
  }

  onFilterChange(event: Event): void {
    const statut = (event.target as HTMLSelectElement).value;
    this.filterStatut.set(statut);
    this.currentPage.set(1); // Reiniciar a la primera página al filtrar

    if (statut === 'ALL') {
      this.loadInitialData();
    } else {
      this.isLoading.set(true);
      this.candidatureService.getByStatut(statut as StatutCandidature).subscribe({
        next: (data) => {
          this.candidatures.set(data);
          this.isLoading.set(false);
        }
      });
    }
  }

  updateStatutDirect(candidature: Candidature, newStatut: StatutCandidature): void {
    const payload = { statut: newStatut };
    this.candidatureService.update(candidature.id, payload).subscribe({
      next: (updated) => {
        this.candidatures.update(list => list.map(c => c.id === updated.id ? updated : c));
      }
    });
  }

  openModal(): void {
    this.candidatureForm.reset({ statut: 'RECUE' });
    this.cvsCandidat.set([]);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.candidatureForm.invalid) return;

    this.isSubmitting.set(true);
    const val = this.candidatureForm.value;

    const payload: Partial<Candidature> = {
      candidat: { id: val.candidatId } as Candidat,
      offre: { id: val.offreId } as OffreEmploi,
      cv: { id: val.cvId } as Cv,
      statut: val.statut,
      commentaireRH: val.commentaireRH
    };

    this.candidatureService.postuler(payload).subscribe({
      next: (newCandidature) => {
        this.candidatures.update(list => [newCandidature, ...list]);
        this.closeModal();
        this.isSubmitting.set(false);
        this.currentPage.set(1); // Volver al inicio para ver el elemento recién añadido
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      }
    });
  }
  deleteCandidature(id: number): void {
    if (confirm('Voulez-vous supprimer cette candidature ?')) {
      this.candidatureService.delete(id).subscribe({
        next: () => {
          this.candidatures.update(list => list.filter(c => c.id !== id));
          // Ajustar página si la actual se queda vacía
          if (this.paginatedCandidatures().length === 0 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
          }
        }
      });
    }
  }
}