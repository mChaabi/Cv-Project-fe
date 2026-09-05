// src/app/services/competence.ts (ou competence.service.ts selon ta config CLI)
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competence } from '../models/competence';


@Injectable({ providedIn: 'root' })
export class CompetenceService {
  private http = inject(HttpClient);
 private apiUrl = 'http://localhost:8080/api/competences';

  getAll(): Observable<Competence[]> {
    return this.http.get<Competence[]>(this.apiUrl);
  }

  create(competence: Partial<Competence>): Observable<Competence> {
    return this.http.post<Competence>(this.apiUrl, competence);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}