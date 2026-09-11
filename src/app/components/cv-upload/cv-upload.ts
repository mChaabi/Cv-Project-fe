import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CandidatService } from '../../services/candidat';
import { Candidat } from '../../models/candidat';
import { CvService } from '../../services/cv';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './cv-upload.html',
  styleUrls: ['./cv-upload.scss'] // Réutilise ou étend le SCSS
})
export class CvUploadComponent implements OnInit {
  private cvService = inject(CvService);
  private candidatService = inject(CandidatService);
  private router = inject(Router);

  candidats = signal<Candidat[]>([]);
  isAnalyzing = signal(false);

  selectedCandidatId: number | null = null;
  selectedFile: File | null = null;
  extractedPreviewData = signal<any>(null);

  ngOnInit(): void {
    this.candidatService.getAll().subscribe(data => this.candidats.set(data));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadAndAnalyze(): void {
    if (!this.selectedFile || !this.selectedCandidatId) return;

    this.isAnalyzing.set(true);
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.cvService.analyzeCv(formData).subscribe({
      next: (response) => {
        this.extractedPreviewData.set(response);
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Erreur analyse CV:', err);
        this.isAnalyzing.set(false);
        alert('L\'analyse du CV a échoué. Vérifiez le format du fichier.');
      }
    });
  }

  confirmAndSaveCv(): void {
    const preview = this.extractedPreviewData();
    if (!preview) return;

    const extracted = preview.extracted;
    const payload = {
      candidatId: this.selectedCandidatId,
      fichierUrl: preview.fichierUrl,
      tempFileName: preview.tempFileName,
      originalFileName: preview.originalFileName,
      titre: extracted.candidat?.titrePoste ?? null,
      competences: extracted.competences ?? [],
      experiences: extracted.experiences ?? [],
      formations: extracted.formations ?? []
    };

    this.cvService.confirmCv(payload).subscribe({
      next: () => {
        alert('CV enregistré avec succès !');
        this.router.navigate(['/cvs']);
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement', err);
        alert('Erreur lors de l\'enregistrement du CV.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/cvs']);
  }
}