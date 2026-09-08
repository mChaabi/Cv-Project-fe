import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilisateurService } from '../../services/utilisateur';
import { Utilisateur, RoleUtilisateur } from '../../models/utilisateur';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './utilisateurs.html',
  styleUrls: ['./utilisateurs.scss']
})
export class UtilisateursComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private fb = inject(FormBuilder);

  utilisateurs = signal<Utilisateur[]>([]);
  isLoading = signal<boolean>(true);
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  
  // Filtro y paginación
  filterRole = signal<string>('ALL');
  currentPage = signal<number>(1);
  pageSize = 5; // Número de usuarios por página

  // Señales computadas para filtrado y paginación reactiva
  filteredUtilisateurs = computed(() => {
    const role = this.filterRole();
    const list = this.utilisateurs();
    if (role === 'ALL') {
      return list;
    }
    return list.filter(u => u.role === role);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredUtilisateurs().length / this.pageSize) || 1;
  });

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  paginatedUtilisateurs = computed(() => {
    const list = this.filteredUtilisateurs();
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return list.slice(start, end);
  });

  userForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['RH' as RoleUtilisateur, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.isLoading.set(true);
    this.utilisateurService.getAll().subscribe({
      next: (data) => {
        this.utilisateurs.set(data);
        this.isLoading.set(false);
        this.currentPage.set(1);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  mathMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  onFilterChange(event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    this.filterRole.set(role);
    this.currentPage.set(1); // Reiniciar a la primera página al cambiar filtro
  }

  openModal(): void {
    this.userForm.reset({ role: 'RH' });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting.set(true);
    const payload: Partial<Utilisateur> = this.userForm.value;

    this.utilisateurService.create(payload).subscribe({
      next: (newUser) => {
        this.utilisateurs.update(list => [newUser, ...list]);
        this.closeModal();
        this.isSubmitting.set(false);
        this.currentPage.set(1);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting.set(false);
      }
    });
  }

  deleteUtilisateur(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.utilisateurService.delete(id).subscribe({
        next: () => {
          this.utilisateurs.update(list => list.filter(u => u.id !== id));
          if (this.paginatedUtilisateurs().length === 0 && this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
          }
        }
      });
    }
  }
}