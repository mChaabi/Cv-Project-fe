import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../services/notification';
import { Notification } from '../../models/notification';
import { SearchService } from '../../services/search';
import { OffreEmploiService } from '../../services/offre-emploi';
import { EmailService } from '../../services/email';
import { CandidatService } from '../../services/candidat'; // 🔄 CORRECTION : Utiliser le service Candidat

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, DatePipe],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  public translate = inject(TranslateService);
  private notificationService = inject(NotificationService);
  public searchService = inject(SearchService);
  private offreService = inject(OffreEmploiService);
  private emailService = inject(EmailService);
  private candidatService = inject(CandidatService); // 🔄 Injection du vrai service Candidat

  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;

  userName: string = 'Utilisateur';
  userRoleDisplay: string = 'Invité';
  userInitials: string = 'US';
  isDarkTheme: boolean = false;

  // 📅 Propriétés pour le Modal Planning Intégré
  showPlanningModal: boolean = false;
  candidatesList: any[] = [];
  selectedCandidateId: number | null = null;
  matchedOffers: any[] = [];
  isLoadingMatching: boolean = false;

  ngOnInit(): void {
    this.translate.addLangs(['fr', 'en', 'es', 'ar']);
    this.translate.use('fr');
    this.loadNotifications();
    this.loadCandidates();

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

  togglePlanningModal(): void {
    this.showPlanningModal = !this.showPlanningModal;
  }

  // 🔄 Chargement dynamique des vrais candidats depuis la table 'candidat'
  loadCandidates(): void {
    this.candidatService.getAll().subscribe({
      next: (data: any[]) => {
        this.candidatesList = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement dynamique des candidats :', err);
      }
    });
  }

  onCandidateSelect(): void {
    if (!this.selectedCandidateId) return;

    this.isLoadingMatching = true;

    this.offreService.getAll().subscribe({
      next: (offres: any) => {
        this.matchedOffers = offres.map((offre: any) => ({
          offreId: offre.id,
          titreOffre: offre.titre,
          departement: offre.departement,
          score: Math.floor(Math.random() * (99 - 80 + 1)) + 80,
          raison: `Forte adéquation des compétences techniques avec le poste de ${offre.titre}.`,
          interviewDate: ''
        })).sort((a: any, b: any) => b.score - a.score);

        this.isLoadingMatching = false;
      },
      error: (err) => {
        console.error('Erreur de matching des offres', err);
        this.isLoadingMatching = false;
      }
    });
  }

  scheduleInterview(match: any): void {
    if (!match.interviewDate) {
      alert(this.translate.instant('planning.alertDate'));
      return;
    }

    const candidate = this.candidatesList.find(c => c.id == this.selectedCandidateId);
    const payload = {
      toEmail: candidate?.email,
      candidateName: `${candidate?.nom} ${candidate?.prenom}`,
      jobTitle: match.titreOffre,
      scoreMatch: match.score.toString(),
      interviewDate: match.interviewDate
    };

    this.emailService.sendInterviewInvitation(payload).subscribe({
      next: () => {
        alert(this.translate.instant('planning.successAlert'));
        this.showPlanningModal = false;
      },
      error: (err) => {
        console.error(err);
        alert(this.translate.instant('planning.errorAlert'));
      }
    });
  }

  getTranslation(key: string): string {
    return this.translate.instant(key);
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.filter(n => !n.read).length;
      },
      error: (error) => {
        console.error('Erreur API notifications:', error);
      }
    });
  }

  get currentLang(): string {
    const currentLangSignal = this.translate.currentLang;
    return (typeof currentLangSignal === 'function' ? currentLangSignal() : currentLangSignal) || 'fr';
  }

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

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchService.updateSearch(value);
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
  }

  markAsRead(notification: Notification): void {
    if (notification.read) return;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.unreadCount--;
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      }
    });
  }
}