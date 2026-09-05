import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation } from '../models/formation';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/formations';

  getAll(): Observable<Formation[]> {
    return this.http.get<Formation[]>(this.apiUrl);
  }

  getById(id: number): Observable<Formation> {
    return this.http.get<Formation>(`${this.apiUrl}/${id}`);
  }

  getByCvId(cvId: number): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${this.apiUrl}/cv/${cvId}`);
  }

  create(formation: Partial<Formation>): Observable<Formation> {
    return this.http.post<Formation>(this.apiUrl, formation);
  }

  update(id: number, formation: Partial<Formation>): Observable<Formation> {
    return this.http.put<Formation>(`${this.apiUrl}/${id}`, formation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}