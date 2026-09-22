
export interface Candidat {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  linkedinUrl: string;
  dateNaissance: string; // format ISO "YYYY-MM-DD"
  addedDate?: string;
  poste:string;
}