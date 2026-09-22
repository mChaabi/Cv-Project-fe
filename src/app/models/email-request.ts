export interface EmailRequest {
  toEmail: string;
  candidateName: string;
  jobTitle: string;
  scoreMatch: string;
  interviewDate: string;
  candidatId?: number; // Ajouté ici
}