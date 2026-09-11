import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OffreEmploiService } from '../../services/offre-emploi';
import { OffreEmploi } from '../../models/offre-emploi';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchService } from '../../services/search';

@Component({
  selector: 'app-offres-emploi',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './offres-emploi.html',
  styleUrls: ['./offres-emploi.scss']
})
export class OffresEmploiComponent implements OnInit {
  private offreService = inject(OffreEmploiService);
  private router = inject(Router);
  private searchService = inject(SearchService);

  offres = signal<OffreEmploi[]>([]);
  isLoading = signal<boolean>(true);
  filterStatut = signal<string>('ALL');

  // Paramètres de pagination (par exemple, 6 éléments par page pour s'adapter à une grille)
  currentPage = signal<number>(1);
  pageSize = 6;

  // Calcul dynamique des pages totales
  totalPages = computed(() => {
    return Math.ceil(this.offres().length / this.pageSize) || 1;
  });

  // Tableau pour générer les boutons de numéros de page
  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Extraction uniquement des éléments de la page active
  paginatedOffres = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.offres().slice(start, end);
  });

  ngOnInit(): void {
    this.loadOffres();
  }
  loadOffres(): void {
    this.isLoading.set(true);
    this.offreService.getAll().subscribe({
      next: (data) => {
        this.offres.set(data);
        this.isLoading.set(false);
        this.currentPage.set(1);
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
    this.currentPage.set(1); // Retour à la première page lors d'un changement de filtre

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

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  navigateToCreate(): void {
    this.router.navigate(['/offres/nouvelle']);
  }

  // Filtrage automatique selon ce qu'on tape dans la Navbar
  filteredOffres = computed(() => {
    const query = this.searchService.searchTerm().toLowerCase();
    const currentList = this.offres();

    if (!query) return currentList;

    return currentList.filter(offre =>
      (offre.titre && offre.titre.toLowerCase().includes(query)) ||
      (offre.description && offre.description.toLowerCase().includes(query)) ||
      (offre.departement && offre.departement.toLowerCase().includes(query)) // Remplace .lieu par .departement si c'est le nom de la propriété dans ton modèle
    );
  });

  deleteOffre(id: number): void {
    if (confirm('Voulez-vous supprimer cette offre ?')) {
      this.offreService.delete(id).subscribe({
        next: () => this.offres.update(list => list.filter(o => o.id !== id))
      });
    }
  }
}