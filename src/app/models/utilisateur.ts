export type RoleUtilisateur = 'ADMIN' | 'RH';

export interface Utilisateur {
  id?: number;
  username: string;
  email: string;
  password?: string; // Optionnel côté front (à ne pas renvoyer/afficher si inutile)
  role: RoleUtilisateur;
  addedDate?: string;
}