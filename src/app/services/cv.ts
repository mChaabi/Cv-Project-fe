import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cv } from '../models/cv';


@Injectable({
  providedIn: 'root'
})
export class CvService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/cvs';

  getAll(): Observable<Cv[]> {
    return this.http.get<Cv[]>(this.apiUrl);
  }

  getById(id: number): Observable<Cv> {
    return this.http.get<Cv>(`${this.apiUrl}/${id}`);
  }

  getByCandidatId(candidatId: number): Observable<Cv[]> {
    return this.http.get<Cv[]>(`${this.apiUrl}/candidat/${candidatId}`);
  }

  create(cv: Partial<Cv>): Observable<Cv> {
    return this.http.post<Cv>(this.apiUrl, cv);
  }

  update(id: number, cv: Partial<Cv>): Observable<Cv> {
    return this.http.put<Cv>(`${this.apiUrl}/${id}`, cv);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Dans cv.service.ts
  uploadAndParse(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);
  }

  analyzeCv(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze`, formData);
  }

  confirmCv(payload: any): Observable<Cv> {
    return this.http.post<Cv>(`${this.apiUrl}/confirm`, payload);
  }

  // Versión de la función adaptada para usarse sin eventos
  private irAEntrevistaDirecto(cv: Cv): void {
    const candidatId = cv.candidat?.id ?? (cv as any).candidatId;
    const url = `http://localhost:8081/start?candidatId=${candidatId}&poste=${encodeURIComponent(cv.titre)}`;
    window.location.href = url;
  }
}