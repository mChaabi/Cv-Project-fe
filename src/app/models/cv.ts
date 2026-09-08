
export interface Cv {
  id: number;
  titre: string;
  fichierUrl: string;
  candidat?: { id: number; nom: string; prenom: string ; email?:String; telephone?:String };
  candidatNomComplet?: string;
  experiences?: { poste: string; entreprise: string; description?: string }[];
  formations?: { diplome: string; etablissement: string }[];
  competences?: { id: number; libelle: string }[];
}