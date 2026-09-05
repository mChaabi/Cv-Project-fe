import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CvService } from '../../services/cv';
import { CandidatService } from '../../services/candidat';
import { CompetenceService } from '../../services/competence';
import { Cv } from '../../models/cv';
import { Candidat } from '../../models/candidat';
import { Competence } from '../../models/competence';

@Component({
  selector: 'app-cvs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cvs.html',
  styleUrls: ['./cvs.scss']
})
export class CvsComponent implements OnInit {
  private cvService = inject(CvService);
  private candidatService = inject(CandidatService);
  private competenceService = inject(CompetenceService);
  private fb = inject(FormBuilder);

  cvs = signal<Cv[]>([]);
  candidats = signal<Candidat[]>([]);
  competences = signal<Competence[]>([]);
  
  isLoading = signal<boolean>(true);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  selectedFileName = signal<string>('');

  cvForm: FormGroup = this.fb.group({
    titre: ['', [Validators.required, Validators.minLength(3)]],
    candidatId: ['', [Validators.required]],
    fichierUrl: ['', [Validators.required]],
    competenceIds: [[]],
    experiences: this.fb.array([]),
    formations: this.fb.array([])
  });

  ngOnInit(): void {
    this.loadData();
  }

  get experiencesArray(): FormArray {
    return this.cvForm.get('experiences') as FormArray;
  }

  get formationsArray(): FormArray {
    return this.cvForm.get('formations') as FormArray;
  }

  loadData(): void {
    this.isLoading.set(true);
    this.cvService.getAll().subscribe({
      next: (data) => {
        this.cvs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    this.candidatService.getAll().subscribe({
      next: (data) => this.candidats.set(data)
    });

    this.competenceService.getAll().subscribe({
      next: (data) => this.competences.set(data)
    });
  }

  // File Upload Simulation
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFileName.set(file.name);
      // Simulation d'URL générée après upload backend
      const fakeUrl = `/uploads/cvs/${Date.now()}_${file.name}`;
      this.cvForm.patchValue({ fichierUrl: fakeUrl });
    }
  }

  // Gestion dynamique des Expériences
  addExperience(): void {
    const expGroup = this.fb.group({
      poste: ['', Validators.required],
      entreprise: ['', Validators.required],
      dateDebut: [''],
      dateFin: [''],
      description: ['']
    });
    this.experiencesArray.push(expGroup);
  }

  removeExperience(index: number): void {
    this.experiencesArray.removeAt(index);
  }

  // Gestion dynamique des Formations
  addFormation(): void {
    const formGroup = this.fb.group({
      diplome: ['', Validators.required],
      etablissement: ['', Validators.required],
      anneeObtention: ['']
    });
    this.formationsArray.push(formGroup);
  }

  removeFormation(index: number): void {
    this.formationsArray.removeAt(index);
  }

  // Inverser la sélection des compétences
  toggleCompetence(id: number): void {
    const current: number[] = this.cvForm.value.competenceIds || [];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    this.cvForm.patchValue({ competenceIds: [...current] });
  }

  isCompetenceSelected(id: number): boolean {
    return (this.cvForm.value.competenceIds || []).includes(id);
  }

  openModal(): void {
    this.cvForm.reset({ competenceIds: [] });
    this.experiencesArray.clear();
    this.formationsArray.clear();
    this.selectedFileName.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.cvForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.cvForm.value;

    const payload = {
      titre: formValue.titre,
      fichierUrl: formValue.fichierUrl,
      candidat: { id: formValue.candidatId },
      experiences: formValue.experiences,
      formations: formValue.formations,
      competences: formValue.competenceIds.map((id: number) => ({ id }))
    };

    this.cvService.create(payload as any).subscribe({
      next: (newCv) => {
        this.cvs.update(list => [newCv, ...list]);
        this.closeModal();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      }
    });
  }

  deleteCv(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce CV ?')) {
      this.cvService.delete(id).subscribe({
        next: () => this.cvs.update(list => list.filter(c => c.id !== id))
      });
    }
  }
}