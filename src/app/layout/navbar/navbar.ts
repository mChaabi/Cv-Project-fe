import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../services/notification';
import { Notification } from '../../models/notification';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe, DatePipe],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  public translate = inject(TranslateService);
  private notificationService = inject(NotificationService);

  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;

  userName: string = 'Utilisateur';
  userRoleDisplay: string = 'Invité';
  userInitials: string = 'US';
  isDarkTheme: boolean = false;

  ngOnInit(): void {
    this.translate.addLangs(['fr', 'en', 'es', 'ar']);
    this.translate.use('fr');
    this.loadNotifications();

    if (isPlatformBrowser(this.platformId)) {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          const user = JSON.parse(userStr);
          this.userName = user.nomComplet || user.name || user.email || 'Utilisateur';
          const rawRole = user.role || user.userRole || user.type || localStorage.getItem('userRole') || 'CANDIDAT';
          this.formatRole(rawRole.toUpperCase());
          this.userInitials = this.getInitials(this.userName);
        }

        const savedTheme = localStorage.getItem('appTheme');
        if (savedTheme === 'glass') {
          this.isDarkTheme = true;
          document.body.classList.add('glass-theme');
        }
      } catch (e) {
        console.error('Erreur lecture navbar', e);
      }
    }
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  loadNotifications(): void {
    console.log('🔔 Chargement notifications...');
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        console.log('✅ Notifications reçues:', data);
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.read).length; // <-- Usar 'read'
        console.log('🔴 Non lues:', this.unreadCount);
      },
      error: (error) => {
        console.error('❌ Erreur API notifications:', error);
      }
    });
  }

  // Récupérer proprement la langue courante pour le [value] du select
  get currentLang(): string {
    const currentLangSignal = this.translate.currentLang;
    return (typeof currentLangSignal === 'function' ? currentLangSignal() : currentLangSignal) || 'fr';
  }

  // Événement déclenché lors du changement dans le select
  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      this.switchLanguage(selectElement.value);
    }
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang).subscribe(() => { });
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }

  private formatRole(role: string): void {
    switch (role) {
      case 'ADMIN': this.userRoleDisplay = 'Administrateur RH'; break;
      case 'RH': this.userRoleDisplay = 'Chargé(e) RH'; break;
      case 'CANDIDAT': this.userRoleDisplay = 'Candidat'; break;
      default: this.userRoleDisplay = role;
    }
  }

  private getInitials(name: string): string {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkTheme) {
        document.body.classList.add('glass-theme');
        localStorage.setItem('appTheme', 'glass');
      } else {
        document.body.classList.remove('glass-theme');
        localStorage.setItem('appTheme', 'light');
      }
    }
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    console.log('CLICK NOTIFICATION');
    console.log('showNotifications:', this.showNotifications);
    console.log('notifications:', this.notifications);
  }

  markAsRead(notification: Notification): void {
    if (notification.read) { // <-- Usar 'read'
      return;
    }

    this.notificationService.markAsRead(notification.id)
      .subscribe({
        next: () => {
          notification.read = true; // <-- Usar 'read'
          this.unreadCount--;
        },
        error: (error) => {
          console.error('Erreur lors du marquage comme lu', error);
        }
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .subscribe({
        next: () => {
          this.notifications.forEach(
            notification => notification.read = true // <-- Usar 'read'
          );
          this.unreadCount = 0;
        },
        error: (error) => {
          console.error('Erreur lors du marquage des notifications', error);
        }
      });
  }
}