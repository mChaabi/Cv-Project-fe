import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidat } from '../models/candidat';


@Injectable({
  providedIn: 'root'
})
export class CandidatService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/candidats';

  getAll(): Observable<Candidat[]> {
    return this.http.get<Candidat[]>(this.apiUrl);
  }

  getById(id: number): Observable<Candidat> {
    return this.http.get<Candidat>(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<Candidat[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Candidat[]>(`${this.apiUrl}/search`, { params });
  }

  create(candidat: Partial<Candidat>): Observable<Candidat> {
    return this.http.post<Candidat>(this.apiUrl, candidat);
  }

  update(id: number, candidat: Partial<Candidat>): Observable<Candidat> {
    return this.http.put<Candidat>(`${this.apiUrl}/${id}`, candidat);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}