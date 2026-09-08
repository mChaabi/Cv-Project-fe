import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  public translate = inject(TranslateService);

  userName: string = 'Utilisateur';
  userRoleDisplay: string = 'Invité';
  userInitials: string = 'US';
  isDarkTheme: boolean = false;

  ngOnInit(): void {
    this.translate.addLangs(['fr', 'en', 'es', 'ar']);
    this.translate.use('fr');

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
    this.translate.use(lang).subscribe(() => {});
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
}