import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OffreEmploi } from '../models/offre-emploi';

@Injectable({
  providedIn: 'root'
})
export class OffreEmploiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/offres-emploi';

  getAll(): Observable<OffreEmploi[]> {
    return this.http.get<OffreEmploi[]>(this.apiUrl);
  }

  getById(id: number): Observable<OffreEmploi> {
    return this.http.get<OffreEmploi>(`${this.apiUrl}/${id}`);
  }

  getByStatut(statut: 'OUVERTE' | 'FERMEE'): Observable<OffreEmploi[]> {
    return this.http.get<OffreEmploi[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getByDepartement(departement: string): Observable<OffreEmploi[]> {
    return this.http.get<OffreEmploi[]>(`${this.apiUrl}/departement/${departement}`);
  }

  create(offre: Partial<OffreEmploi>): Observable<OffreEmploi> {
    return this.http.post<OffreEmploi>(this.apiUrl, offre);
  }

  update(id: number, offre: Partial<OffreEmploi>): Observable<OffreEmploi> {
    return this.http.put<OffreEmploi>(`${this.apiUrl}/${id}`, offre);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}