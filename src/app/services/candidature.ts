import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature, StatutCandidature } from '../models/candidature';


@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/candidatures';

  getAll(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.apiUrl);
  }

  getById(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.apiUrl}/${id}`);
  }

  getByOffre(offreId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/offre/${offreId}`);
  }

  getByCandidat(candidatId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/candidat/${candidatId}`);
  }

  getByStatut(statut: StatutCandidature): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/statut/${statut}`);
  }

  postuler(candidature: Partial<Candidature>): Observable<Candidature> {
    return this.http.post<Candidature>(this.apiUrl, candidature);
  }

  update(id: number, candidature: Partial<Candidature>): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/${id}`, candidature);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}