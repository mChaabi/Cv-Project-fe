import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CandidatService } from '../../../../services/candidat';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-candidat-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslatePipe],
  templateUrl: './candidat-edit.html',
  styleUrls: ['./candidat-edit.scss']
})
export class CandidatEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidatService = inject(CandidatService);

  candidatId!: number;
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  candidatForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.candidatId = Number(idParam);
      this.loadCandidatData(this.candidatId);
    }
  }

  loadCandidatData(id: number): void {
    this.candidatService.getById(id).subscribe({
      next: (data) => {
        this.candidatForm.patchValue(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.candidatForm.invalid) {
      this.candidatForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.candidatService.update(this.candidatId, this.candidatForm.value).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/candidats']);
      },
      error: (err) => {
        console.error(err);
        this.isSaving.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/candidats']);
  }
}