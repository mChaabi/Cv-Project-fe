import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Interview } from '../models/interview';

@Injectable({ providedIn: 'root' })
export class InterviewReportService {
    // Voice-service Flask — puerto distinto al backend principal Spring (8080)
    private apiUrl = 'http://localhost:5000/api/interviews';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Interview[]> {
        return this.http.get<Interview[]>(this.apiUrl);
    }

    getByCandidatId(candidatId: string): Observable<Interview> {
        return this.http.get<Interview>(`${this.apiUrl}/${candidatId}`);
    }
}