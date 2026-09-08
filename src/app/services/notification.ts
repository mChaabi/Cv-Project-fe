import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/api/notifications';

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiUrl}/unread`
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/read-all`,
      {}
    );
  }
}