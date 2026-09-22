import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CandidatService } from '../../services/candidat';
import { Candidat } from '../../models/candidat';
import { CvService } from '../../services/cv';
import { TranslatePipe } from '@ngx-translate/core';

interface ExperienceForm {
  poste: string;
  entreprise: string;
  lieu: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  description: string | null;
}

interface FormationForm {
  diplome: string;
  etablissement: string;
  lieu: string | null;
  anneeObtention: number | null;
}

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './cv-upload.html',
  styleUrls: ['./cv-upload.scss']
})
export class CvUploadComponent implements OnInit {
  private cvService = inject(CvService);
  private candidatService = inject(CandidatService);
  private router = inject(Router);

  candidats = signal<Candidat[]>([]);
  isAnalyzing = signal(false);
  isSaving = signal(false);

  selectedCandidatId: number | null = null;
  selectedFile: File | null = null;

  // Bandera que activa el paso 2 (formulario) una vez analizado
  showEditForm = signal(false);
  fichierUrl: string | null = null;

  // ── Modelo editable, poblado con lo que devuelve la IA ──
  formData = {
    titrePoste: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    linkedinUrl: '',
    adresse: ''
  };

  competences: string[] = [];
  newCompetence = '';

  experiences: ExperienceForm[] = [];
  formations: FormationForm[] = [];

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
      next: (response: any) => {
        this.fichierUrl = response.fichierUrl;
        this.populateFormFromExtraction(response.extracted);
        this.showEditForm.set(true);
        this.isAnalyzing.set(false);
      },
      error: (err) => {
        console.error('Erreur analyse CV:', err);
        this.isAnalyzing.set(false);
        alert("L'analyse du CV a échoué. Vérifiez le format du fichier.");
      }
    });
  }

  // ── Precarga el formulario editable con lo que devolvió Gemini ──
  private populateFormFromExtraction(extracted: any): void {
    const c = extracted?.candidat ?? {};
    this.formData = {
      titrePoste: c.titrePoste ?? '',
      nom: c.nom ?? '',
      prenom: c.prenom ?? '',
      email: c.email ?? '',
      telephone: c.telephone ?? '',
      dateNaissance: c.dateNaissance ?? '',
      linkedinUrl: c.linkedinUrl ?? '',
      adresse: c.adresse ?? ''
    };

    this.competences = Array.isArray(extracted?.competences) ? [...extracted.competences] : [];

    this.experiences = (extracted?.experiences ?? []).map((e: any) => ({
      poste: e.poste ?? '',
      entreprise: e.entreprise ?? '',
      lieu: e.lieu ?? null,
      dateDebut: e.dateDebut ?? null,
      dateFin: e.dateFin ?? null,
      description: e.description ?? null
    }));

    this.formations = (extracted?.formations ?? []).map((f: any) => ({
      diplome: f.diplome ?? '',
      etablissement: f.etablissement ?? '',
      lieu: f.lieu ?? null,
      anneeObtention: f.anneeObtention ?? null
    }));
  }

  // ── Gestión de competencias (chips) ──
  addCompetence(): void {
    const val = this.newCompetence.trim();
    if (val && !this.competences.includes(val)) {
      this.competences.push(val);
    }
    this.newCompetence = '';
  }

  removeCompetence(index: number): void {
    this.competences.splice(index, 1);
  }

  // ── Gestión de experiencias ──
  addExperience(): void {
    this.experiences.push({
      poste: '', entreprise: '', lieu: null, dateDebut: null, dateFin: null, description: null
    });
  }

  removeExperience(index: number): void {
    this.experiences.splice(index, 1);
  }

  // ── Gestión de formaciones ──
  addFormation(): void {
    this.formations.push({ diplome: '', etablissement: '', lieu: null, anneeObtention: null });
  }

  removeFormation(index: number): void {
    this.formations.splice(index, 1);
  }

  // ── Guardar el CV con los datos ya corregidos por el usuario ──
  saveCv(): void {
    if (!this.selectedCandidatId || !this.fichierUrl) return;

    this.isSaving.set(true);

    const payload = {
      candidatId: this.selectedCandidatId,
      fichierUrl: this.fichierUrl,
      titre: this.formData.titrePoste || 'CV sans titre',
      competencesNoms: this.competences,
      experiences: this.experiences,
      formations: this.formations
    };

    this.cvService.confirmCv(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        alert('CV enregistré avec succès !');
        this.router.navigate(['/cvs']);
      },
      error: (err) => {
        console.error("Erreur lors de l'enregistrement", err);
        this.isSaving.set(false);
        alert("Erreur lors de l'enregistrement du CV.");
      }
    });
  }

  cancelEdit(): void {
    this.showEditForm.set(false);
    this.selectedFile = null;
    this.fichierUrl = null;
  }

  goBack(): void {
    this.router.navigate(['/cvs']);
  }
}