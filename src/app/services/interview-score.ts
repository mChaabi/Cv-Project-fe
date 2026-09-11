import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InterviewScoreReport {
    interviewScore: number | null;
    presenceScore: number;
    feedback: string;
}

@Injectable({ providedIn: 'root' })
export class InterviewScoreService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:5000/api/surveillance';

    getScore(candidatId: number | string): Observable<InterviewScoreReport> {
        return this.http.get<InterviewScoreReport>(`${this.baseUrl}/${candidatId}`);
    }
}