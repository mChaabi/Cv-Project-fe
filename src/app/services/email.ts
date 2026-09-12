import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailRequest {
  toEmail: string;
  candidateName: string;
  jobTitle: string;
  scoreMatch: string;
  interviewDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:8080/api/emails/send-invitation';

  constructor(private http: HttpClient) { }

  sendInterviewInvitation(data: EmailRequest): Observable<string> {
    return this.http.post(this.apiUrl, data, { responseType: 'text' });
  }
}