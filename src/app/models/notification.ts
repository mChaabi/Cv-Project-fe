export interface Notification {
  id: number;
  title?: string;
  message: string;
  type: string;
  read: boolean;       // <-- Cambiado de 'lu' a 'read'
  createdAt: string;   // <-- Cambiado de 'dateCreation' a 'createdAt'
  offerId?: number;
  candidateId?: number;
}