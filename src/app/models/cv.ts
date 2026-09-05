import { Candidat } from "./candidat";
import { Competence } from "./competence";
import { Experience } from "./experience";
import { Formation } from "./formation";

export interface Cv {
  id: number;
  candidat: Candidat;
  titre: string;
  fichierUrl: string;
  experiences?: Experience[];
  formations?: Formation[];
  competences?: Competence[];
  dateUpload?: string;
}