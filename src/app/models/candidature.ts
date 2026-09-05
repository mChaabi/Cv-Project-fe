import { Candidat } from './candidat';
import { OffreEmploi } from './offre-emploi';
import { Cv } from './cv';

export type StatutCandidature = 'RECUE' | 'PRESELECTIONNEE' | 'ENTRETIEN' | 'ACCEPTEE' | 'REFUSEE';

export interface Candidature {
  id: number;
  candidat: Candidat;
  offre: OffreEmploi;
  cv: Cv;
  statut: StatutCandidature;
  commentaireRH?: string;
  dateCandidature?: string;
}