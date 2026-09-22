import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { InterviewRow } from '../../models/interview';
import { InterviewReportService } from '../../services/interview-report';
import { CandidatService } from '../../services/candidat';

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './interview-list.html',
  styleUrls: ['./interview-list.scss']
})
export class InterviewListComponent implements OnInit {
  private interviewService = inject(InterviewReportService);
  private candidatService = inject(CandidatService);
  private translate = inject(TranslateService);

  rows = signal<InterviewRow[]>([]);
  isLoading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  expandedId = signal<string | null>(null);
  filterStatus = signal<'ALL' | 'completed' | 'disqualified'>('ALL');

  filteredRows = computed(() => {
    const status = this.filterStatus();
    const list = this.rows();
    return status === 'ALL' ? list : list.filter(r => r.status === status);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMsg.set(null);

    forkJoin({
      interviews: this.interviewService.getAll(),
      candidats: this.candidatService.getAll()
    }).subscribe({
      next: ({ interviews, candidats }) => {
        // 🔎 Ouvre ta console F12 pour voir ces logs !
        console.log('Liste des interviews:', interviews);
        console.log('Liste des candidats:', candidats);

        const merged: InterviewRow[] = interviews.map(interview => {
          // Teste si l'ID correspond (en ignorant le type string vs number)
          const candidat = candidats.find(c => String(c.id) === String(interview.candidatId));
          console.log(`Entretien ID candidat (${interview.candidatId}) trouvé ?`, candidat);

          return {
            ...interview,
            candidateName: candidat ? `${candidat.nom || ''} ${candidat.prenom || ''}`.trim() : `Candidat #${interview.candidatId}`,
            candidateEmail: candidat?.email ?? '—',
            poste: interview.poste || candidat?.poste || '—'
          };
        });

        this.rows.set(merged);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement :', err);
        this.errorMsg.set(this.translate.instant('interviews.errorLoad'));
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'ALL' | 'completed' | 'disqualified';
    this.filterStatus.set(value);
  }

  toggleDetail(candidatId: string): void {
    this.expandedId.set(this.expandedId() === candidatId ? null : candidatId);
  }

  isExpanded(candidatId: string): boolean {
    return this.expandedId() === candidatId;
  }

  scoreClass(score: number | null): string {
    if (score === null) return 'score-none';
    if (score >= 70) return 'score-good';
    if (score >= 40) return 'score-medium';
    return 'score-bad';
  }
}