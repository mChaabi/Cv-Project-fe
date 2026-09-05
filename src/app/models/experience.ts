export interface Experience {
  id?: number;
  poste: string;
  entreprise: string;
  dateDebut?: string; // format "YYYY-MM-DD"
  dateFin?: string | null; // null si poste actuel
  description?: string;
}