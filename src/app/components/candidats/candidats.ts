import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CandidatService } from '../../services/candidat';
import { Candidat } from '../../models/candidat';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidats.html',
  styleUrls: ['./candidats.scss']
})
export class CandidatsComponent implements OnInit {
  private candidatService = inject(CandidatService);
  private fb = inject(FormBuilder);

  candidats = signal<Candidat[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  searchQuery = signal<string>('');

  candidatForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required]]
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
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Erreur lors du chargement des candidats.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);

    if (query.trim().length > 0) {
      this.candidatService.search(query).subscribe({
        next: (data) => this.candidats.set(data)
      });
    } else {
      this.loadCandidats();
    }
  }

  openModal(): void {
    this.candidatForm.reset();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.candidatForm.invalid) return;

    this.isSubmitting.set(true);
    this.candidatService.create(this.candidatForm.value).subscribe({
      next: (newCandidat) => {
        this.candidats.update(list => [newCandidat, ...list]);
        this.closeModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      }
    });
  }

  deleteCandidat(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce candidat ?')) {
      this.candidatService.delete(id).subscribe({
        next: () => {
          this.candidats.update(list => list.filter(c => c.id !== id));
        }
      });
    }
  }
}