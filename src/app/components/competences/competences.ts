import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetenceService } from '../../services/competence';
import { Competence } from '../../models/competence';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-competences',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './competences.html',
  styleUrls: ['./competences.scss']
})
export class CompetencesComponent implements OnInit {
  private competenceService = inject(CompetenceService);

  competences = signal<Competence[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadCompetences();
  }

  loadCompetences(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.competenceService.getAll().subscribe({
      next: (data) => {
        this.competences.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement compétences:', err);
        this.errorMessage.set('Impossible de charger les compétences.');
        this.isLoading.set(false);
      }
    });
  }
}