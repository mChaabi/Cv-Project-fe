import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OffreEmploiService } from '../../services/offre-emploi';
import { OffreEmploi } from '../../models/offre-emploi';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-offres-emploi',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './offres-emploi.html',
  styleUrls: ['./offres-emploi.scss']
})
export class OffresEmploiComponent implements OnInit {
  private offreService = inject(OffreEmploiService);
  private router = inject(Router);

  offres = signal<OffreEmploi[]>([]);
  isLoading = signal<boolean>(true);
  filterStatut = signal<string>('ALL');

  ngOnInit(): void {
    this.loadOffres();
  }

  loadOffres(): void {
    this.isLoading.set(true);
    this.offreService.getAll().subscribe({
      next: (data) => {
        this.offres.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(event: Event): void {
    const statut = (event.target as HTMLSelectElement).value;
    this.filterStatut.set(statut);

    if (statut === 'ALL') {
      this.loadOffres();
    } else {
      this.isLoading.set(true);
      this.offreService.getByStatut(statut as OffreEmploi['statut']).subscribe({
        next: (data) => {
          this.offres.set(data);
          this.isLoading.set(false);
        }
      });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/offres/nouvelle']);
  }

  deleteOffre(id: number): void {
    if (confirm('Voulez-vous supprimer cette offre ?')) {
      this.offreService.delete(id).subscribe({
        next: () => this.offres.update(list => list.filter(o => o.id !== id))
      });
    }
  }
}