import { Component, OnInit, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-candidatures',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  statutsList: StatutCandidature[] = ['RECUE', 'PRESELECTIONNEE', 'ENTRETIEN', 'ACCEPTEE', 'REFUSEE'];

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

  onFilterChange(event: Event): void {
    const statut = (event.target as HTMLSelectElement).value;
    this.filterStatut.set(statut);

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
        next: () => this.candidatures.update(list => list.filter(c => c.id !== id))
      });
    }
  }
}