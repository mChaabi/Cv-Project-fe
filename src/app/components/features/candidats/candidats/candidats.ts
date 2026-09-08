import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CandidatService } from '../../../../services/candidat';
import { Candidat } from '../../../../models/candidat';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './candidats.html',
  styleUrls: ['./candidats.scss']
})
export class CandidatsComponent implements OnInit {
  private candidatService = inject(CandidatService);
  private router = inject(Router);

  candidats = signal<Candidat[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  searchQuery = signal<string>('');

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

  viewCandidat(id: number): void {
    // Redirige vers la page de détails (adaptez la route selon votre projet)
    this.router.navigate(['/candidats/details', id]);
  }

  editCandidat(id: number): void {
    // Redirige vers la page d'édition (adaptez la route selon votre projet)
    this.router.navigate(['/candidats/edit', id]);
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