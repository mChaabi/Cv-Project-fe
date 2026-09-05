import { Component, OnInit, ElementRef, ViewChild, inject, signal, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { CandidatService } from '../../services/candidat';
import { CompetenceService } from '../../services/competence';
import { ExperienceService } from '../../services/experience';
import { FormationService } from '../../services/formation';
import { CandidatureService } from '../../services/candidature';
import { Competence } from '../../models/competence';
import { Experience } from '../../models/experience';
import { Formation } from '../../models/formation';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  private candidatService = inject(CandidatService);
  private competenceService = inject(CompetenceService);
  private experienceService = inject(ExperienceService);
  private formationService = inject(FormationService);
  private candidatureService = inject(CandidatureService);

  @ViewChild('competenceCanvas') competenceCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('experienceCanvas') experienceCanvas!: ElementRef<HTMLCanvasElement>;

  // Charts References
  private competenceChart?: Chart;
  private experienceChart?: Chart;

  // Signals de Données Réelles
  totalCandidats = signal<number>(0);
  totalCandidatures = signal<number>(0);
  totalExperiences = signal<number>(0);
  totalFormations = signal<number>(0);

  competencesList = signal<Competence[]>([]);
  experiencesList = signal<Experience[]>([]);
  formationsList = signal<Formation[]>([]);

  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading.set(true);

    // 1. Charger Candidats & Candidatures
    this.candidatService.getAll().subscribe(data => this.totalCandidats.set(data.length));
    this.candidatureService.getAll().subscribe(data => this.totalCandidatures.set(data.length));

    // 2. Charger Formations
    this.formationService.getAll().subscribe(data => {
      this.formationsList.set(data);
      this.totalFormations.set(data.length);
      this.updateExperienceChart();
    });

    // 3. Charger Expériences
    this.experienceService.getAll().subscribe(data => {
      this.experiencesList.set(data);
      this.totalExperiences.set(data.length);
      this.updateExperienceChart();
    });

    // 4. Charger Compétences Réelles
    this.competenceService.getAll().subscribe(data => {
      this.competencesList.set(data);
      this.updateCompetenceChart();
      this.isLoading.set(false);
    });
  }

  // --- Graphique Dynamique: Compétences ---
  private updateCompetenceChart(): void {
    if (!this.competenceCanvas) return;

    // Regrouper et compter le nombre de fois où chaque compétence apparaît
    const counts: { [key: string]: number } = {};
    this.competencesList().forEach(c => {
      const nom = c.libelle || 'Inconnue';
      counts[nom] = (counts[nom] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const dataValues = Object.values(counts);

    if (this.competenceChart) {
      this.competenceChart.destroy(); // Détruire l'ancien graphique avant de le récréer
    }

    this.competenceChart = new Chart(this.competenceCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels.length > 0 ? labels : ['Aucune compétence'],
        datasets: [{
          data: dataValues.length > 0 ? dataValues : [1],
          backgroundColor: [
            '#6B2737', // bordeaux (accent principal)
            '#8A6D3B', // brun doré
            '#4A5568', // ardoise moyen
            '#232A35', // ardoise foncé
            '#B08D57', // brass clair
            '#8A8F98'  // gris neutre
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  // --- Graphique Dynamique: Expériences & Formations ---
  private updateExperienceChart(): void {
    if (!this.experienceCanvas) return;

    if (this.experienceChart) {
      this.experienceChart.destroy();
    }

    this.experienceChart = new Chart(this.experienceCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Total Enregistré'],
        datasets: [
          {
            label: 'Expériences',
            data: [this.experiencesList().length],
            backgroundColor: '#6B2737', // bordeaux
            borderRadius: 4
          },
          {
            label: 'Formations',
            data: [this.formationsList().length],
            backgroundColor: '#8A8F98', // gris neutre
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
        }
      }
    });
  }
}