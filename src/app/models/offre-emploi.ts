
export interface OffreEmploi {
  id: number;
  titre: string;
  description: string;
  departement: string;
  typeContrat: 'CDI' | 'CDD' | 'STAGE';
  dateExpiration: string;
  statut: 'OUVERTE' | 'FERMEE';
  addedDate?: string;
  dateCreation?: string;
}