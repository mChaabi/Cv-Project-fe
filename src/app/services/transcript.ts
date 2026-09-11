// services/transcript.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TranscriptEntry {
  role: 'ai' | 'candidat';
  text: string;
  timestamp: number;
}

export interface CandidatReport {
  transcript: TranscriptEntry[];
  interviewScore: number | null;
  presenceScore: number;
}

@Injectable({ providedIn: 'root' })
export class TranscriptService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/transcript';

  getTranscript(candidatId: number | string): Observable<{ transcript: TranscriptEntry[] }> {
    return this.http.get<{ transcript: TranscriptEntry[] }>(`${this.baseUrl}/${candidatId}`);
  }
   // ── NOUVEAU : récupère le score directement depuis /api/surveillance/<id> ──
  getScore(candidatId: number | string): Observable<{ interviewScore: number | null; presenceScore: number }> {
    return this.http.get<{ interviewScore: number | null; presenceScore: number }>(`${this.baseUrl}/surveillance/${candidatId}`);
  }
}