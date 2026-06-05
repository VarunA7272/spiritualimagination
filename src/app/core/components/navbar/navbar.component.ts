import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  mobileMenuOpen = false;
  userEmail = '';

  constructor(private authService: AuthService) {
    const session = this.authService.currentSession;
    if (session?.user?.email) {
      this.userEmail = session.user.email;
    }
  }

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    }
  }
}
