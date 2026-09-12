import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OffreEmploiService } from '../../services/offre-emploi';
import { OffreEmploi } from '../../models/offre-emploi';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchService } from '../../services/search';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../../services/email';

@Component({
  selector: 'app-offres-emploi',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule],
  templateUrl: './offres-emploi.html',
  styleUrls: ['./offres-emploi.scss']
})
export class OffresEmploiComponent implements OnInit {
  private offreService = inject(OffreEmploiService);
  private router = inject(Router);
  private searchService = inject(SearchService);
  private emailService = inject(EmailService);

  offres = signal<OffreEmploi[]>([]);
  isLoading = signal<boolean>(true);
  filterStatut = signal<string>('ALL');
  matchingData: { [key: number]: any[] } = {};
  loadingMatching: { [key: number]: boolean } = {};
  showMatchingMap: { [key: number]: boolean } = {};

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

  toggleMatching(offreId: number): void {
    // Inverse l'état (ouvert/fermé)
    const currentState = !!this.showMatchingMap[offreId];
    this.showMatchingMap[offreId] = !currentState;

    // Si on l'ouvre et que les données ne sont pas encore chargées, on les récupère
    if (this.showMatchingMap[offreId] && !this.matchingData[offreId] && !this.loadingMatching[offreId]) {
      this.loadMatchingCandidates(offreId);
    }
  }

  loadMatchingCandidates(offreId: number): void {
    this.loadingMatching[offreId] = true;
    this.offreService.getMatchingCandidates(offreId).subscribe({
      next: (data) => {
        this.matchingData[offreId] = data;
        this.loadingMatching[offreId] = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingMatching[offreId] = false;
      }
    });
  }

  // FONCTION CORRIGÉE POUR ENVOYER L'INVITATION
  sendInvitation(candidate: any, offre: any): void {
    if (!candidate.selectedDate) {
      alert("Veuillez sélectionner une date et une heure pour l'entretien !");
      return;
    }

    const payload = {
      toEmail: candidate.email,
      candidateName: candidate.nomCandidat || `${candidate.nom || ''} ${candidate.prenom || ''}`.trim(),
      jobTitle: offre.titre,
      scoreMatch: candidate.scoreMatch ? candidate.scoreMatch.toString() : '0',
      interviewDate: candidate.selectedDate
    };

    this.emailService.sendInterviewInvitation(payload).subscribe({
      next: () => {
        alert("✅ Invitation envoyée avec succès par e-mail généré par l'IA !");
      },
      error: (err) => {
        console.error(err);
        alert("❌ Erreur lors de l'envoi de l'e-mail.");
      }
    });
  }

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
      (offre.departement && offre.departement.toLowerCase().includes(query))
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