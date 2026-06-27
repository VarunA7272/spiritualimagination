import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <!-- PUBLIC HEADER -->
    <nav id="navbar">
      <div class="nav-inner">
        <a routerLink="/home" class="nav-logo">Spiritual Imagination 🎁</a>
        <ul class="nav-links" id="navLinks">
          <li><a routerLink="/home" routerLinkActive="active">Home</a></li>
          <li><a routerLink="/products" routerLinkActive="active">Products</a></li>
          <li><a routerLink="/about" routerLinkActive="active">About</a></li>
          <li><a routerLink="/reviews" routerLinkActive="active">Reviews</a></li>
          <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
        </ul>
        <div class="hamburger" id="hamburger" [class.open]="mobileMenuOpen" (click)="toggleMenu()">
          <span></span><span></span><span></span>
        </div>
      </div>
    </nav>
    <div class="mobile-menu" id="mobileMenu" [class.open]="mobileMenuOpen">
      <a routerLink="/home" routerLinkActive="active" (click)="closeMobileMenu()">Home</a>
      <a routerLink="/products" routerLinkActive="active" (click)="closeMobileMenu()">Products</a>
      <a routerLink="/about" routerLinkActive="active" (click)="closeMobileMenu()">About</a>
      <a routerLink="/reviews" routerLinkActive="active" (click)="closeMobileMenu()">Reviews</a>
      <a routerLink="/contact" routerLinkActive="active" (click)="closeMobileMenu()">Contact</a>
    </div>

    <!-- MAIN ROUTER OUTLET -->
    <main>
      <router-outlet></router-outlet>
    </main>

    <!-- FOOTER WITH ADMIN LINK -->
    <footer class="public-footer">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <h3>Spiritual Imagination 🎁</h3>
            <p>Crafting Memories, One Gift at a Time</p>
          </div>
          <nav class="footer-links">
            <a routerLink="/home">Home</a>
            <a routerLink="/products">Products</a>
            <a routerLink="/about">About</a>
            <a routerLink="/contact">Contact</a>
            <a routerLink="/login" class="admin-link-badge">🔑 Staff Portal</a>
          </nav>
        </div>
        <div class="footer-bottom">
          © 2025 Spiritual Imagination. All rights reserved. | Jabalpur, Madhya Pradesh
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* NAVIGATION BAR */
    nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(255, 248, 240, 0.72);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1.5px solid rgba(255, 107, 53, 0.12);
      padding: 0 2rem;
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }
    .nav-logo {
      font-family: 'Outfit', sans-serif;
      font-size: 1.35rem;
      font-weight: 900;
      color: var(--primary);
      text-decoration: none;
      letter-spacing: -0.02em;
      transition: transform var(--transition-fast);
    }
    .nav-logo:hover {
      transform: scale(1.02);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      list-style: none;
    }
    .nav-links a {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-mid);
      text-decoration: none;
      transition: all var(--transition-fast);
      padding: 6px 0;
      position: relative;
    }
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary);
      transform: scaleX(0);
      transform-origin: right center;
      transition: transform var(--transition-normal);
    }
    .nav-links a:hover::after,
    .nav-links a.active::after {
      transform: scaleX(1);
      transform-origin: left center;
    }
    .nav-links a:hover,
    .nav-links a.active {
      color: var(--primary);
    }
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      transition: background var(--transition-fast);
    }
    .hamburger:hover {
      background: rgba(255, 107, 53, 0.08);
    }
    .hamburger span {
      width: 24px;
      height: 2px;
      background: var(--primary);
      border-radius: 2px;
      transition: all 0.3s ease;
    }
    .hamburger.open span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .hamburger.open span:nth-child(2) {
      opacity: 0;
    }
    .hamburger.open span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
    .mobile-menu {
      display: none;
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      background: rgba(255, 248, 240, 0.96);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      padding: 1.5rem 2rem;
      border-bottom: 1.5px solid rgba(255, 107, 53, 0.15);
      z-index: 999;
      box-shadow: 0 16px 32px rgba(45, 27, 0, 0.06);
    }
    .mobile-menu.open {
      display: block;
      animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes slideDown {
      from { transform: translateY(-10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .mobile-menu a {
      display: block;
      padding: 0.85rem 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-dark);
      text-decoration: none;
      border-bottom: 1px solid rgba(255, 107, 53, 0.08);
      transition: color var(--transition-fast);
    }
    .mobile-menu a:hover,
    .mobile-menu a.active {
      color: var(--primary);
    }
    main {
      min-height: calc(100vh - 72px - 180px);
    }

    /* FOOTER */
    .public-footer {
      background: linear-gradient(135deg, var(--text-dark) 0%, hsl(30, 20%, 8%) 100%);
      padding: 4.5rem 1.5rem 2.5rem;
      color: #ffffff;
      width: 100%;
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
    }
    .footer-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 2rem;
      margin-bottom: 2.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 2.5rem;
    }
    .footer-brand h3 {
      font-size: 1.6rem;
      font-weight: 900;
      margin-bottom: 6px;
      letter-spacing: -0.02em;
      color: #ffffff;
    }
    .footer-brand p {
      font-size: 0.9rem;
      opacity: 0.65;
      font-weight: 500;
    }
    .footer-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .footer-links a {
      color: rgba(255, 255, 255, 0.75);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 700;
      transition: all var(--transition-fast);
    }
    .footer-links a:hover {
      color: var(--primary);
    }
    .admin-link-badge {
      background: rgba(255, 107, 53, 0.15);
      color: var(--primary) !important;
      border: 1px solid rgba(255, 107, 53, 0.3);
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 0.85rem !important;
    }
    .admin-link-badge:hover {
      background: var(--primary) !important;
      color: #ffffff !important;
    }
    .footer-bottom {
      text-align: center;
      font-size: 0.8rem;
      opacity: 0.45;
      font-weight: 500;
    }

    @media (max-width: 900px) {
      .footer-top {
        flex-direction: column;
        text-align: center;
      }
      .footer-links {
        justify-content: center;
        gap: 1.5rem;
      }
    }
    @media (max-width: 640px) {
      .nav-links {
        display: none;
      }
      .hamburger {
        display: flex;
      }
      nav {
        padding: 0 1.25rem;
      }
    }
  `]
})
export class PublicLayoutComponent {
  mobileMenuOpen = false;

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
}
