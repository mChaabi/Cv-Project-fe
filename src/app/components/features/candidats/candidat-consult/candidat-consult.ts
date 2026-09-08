import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatService } from '../../../../services/candidat';
import { Candidat } from '../../../../models/candidat';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-candidat-consult',
  standalone: true,
  imports: [CommonModule,TranslatePipe],
  templateUrl: './candidat-consult.html',
  styleUrls: ['./candidat-consult.scss']
})
export class CandidatConsultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidatService = inject(CandidatService);

  candidat = signal<Candidat | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.loadCandidat(id);
    }
  }

  loadCandidat(id: number): void {
    this.isLoading.set(true);
    this.candidatService.getById(id).subscribe({
      next: (data) => {
        this.candidat.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Impossible de charger les détails du candidat.');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/candidats']);
  }

  editCandidate(): void {
    const c = this.candidat();
    if (c && c.id) {
      this.router.navigate(['/candidats/edit', c.id]);
    }
  }
}