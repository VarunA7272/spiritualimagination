import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <!-- ADMIN HEADER -->
    <nav class="admin-nav">
      <div class="nav-inner">
        <a routerLink="/admin/upload" class="nav-logo">SI Admin Portal 🛠️</a>
        <div class="nav-right">
          <span class="user-email" *ngIf="userEmail" title="{{ userEmail }}">Logged in: <b>{{ userEmail }}</b></span>
          <button class="btn-logout" (click)="logout()">Sign Out</button>
        </div>
      </div>
    </nav>

    <!-- ADMIN CONTENT OUTLET -->
    <main class="admin-main">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .admin-nav {
      background: #111;
      border-bottom: 2px solid var(--primary);
      padding: 0 2rem;
      color: #ffffff;
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }
    .nav-logo {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      font-weight: 900;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .nav-logo:hover {
      color: var(--primary);
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .user-email {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }
    .user-email b {
      color: #ffffff;
    }
    .btn-logout {
      font-family: 'Outfit', sans-serif;
      font-size: 0.78rem;
      font-weight: 800;
      color: #ffffff;
      background: var(--primary);
      border: none;
      padding: 6px 14px;
      border-radius: 100px;
      cursor: pointer;
      box-shadow: 0 4px 12px var(--primary-glow);
      transition: all var(--transition-fast);
    }
    .btn-logout:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px var(--primary-glow);
    }
    .admin-main {
      min-height: calc(100vh - 64px);
      background: hsl(30, 20%, 98%);
      padding: 2.5rem 1.5rem;
    }
    @media (max-width: 640px) {
      .user-email {
        display: none; /* Hide email on small screens to save space */
      }
      .admin-nav {
        padding: 0 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  userEmail = '';

  constructor(private authService: AuthService) {
    const session = this.authService.currentSession;
    if (session?.user?.email) {
      this.userEmail = session.user.email;
    }
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    }
  }
}
