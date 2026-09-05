import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Experience } from '../models/experience';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/experiences';

  getAll(): Observable<Experience[]> {
    return this.http.get<Experience[]>(this.apiUrl);
  }

  getById(id: number): Observable<Experience> {
    return this.http.get<Experience>(`${this.apiUrl}/${id}`);
  }

  getByCvId(cvId: number): Observable<Experience[]> {
    return this.http.get<Experience[]>(`${this.apiUrl}/cv/${cvId}`);
  }

  create(experience: Partial<Experience>): Observable<Experience> {
    return this.http.post<Experience>(this.apiUrl, experience);
  }

  update(id: number, experience: Partial<Experience>): Observable<Experience> {
    return this.http.put<Experience>(`${this.apiUrl}/${id}`, experience);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}