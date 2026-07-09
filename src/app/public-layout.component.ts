import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from './core/services/cart.service';
import { AuthOtpService } from './core/services/auth-otp.service';
import { SupabaseService } from './core/services/supabase.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
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
          <li>
            <button class="nav-cart-btn" (click)="toggleCartDrawer()">
              🛒 Cart <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
            </button>
          </li>
        </ul>
        <div class="hamburger-container">
          <button class="nav-cart-btn mobile-only-cart" (click)="toggleCartDrawer()">
            🛒 <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </button>
          <div class="hamburger" id="hamburger" [class.open]="mobileMenuOpen" (click)="toggleMenu()">
            <span></span><span></span><span></span>
          </div>
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

    <!-- SLIDE-OUT CART DRAWER -->
    <div class="cart-drawer-backdrop" *ngIf="cartDrawerOpen" (click)="closeCartDrawer()">
      <div class="cart-drawer" (click)="$event.stopPropagation()">
        <div class="drawer-header">
          <h3>Shopping Cart ({{ cartCount }})</h3>
          <button class="btn-close-drawer" (click)="closeCartDrawer()">×</button>
        </div>

        <div class="drawer-body">
          <!-- Empty State -->
          <div class="empty-cart-state" *ngIf="cartItems.length === 0">
            <div class="empty-cart-icon">🛒</div>
            <h4>Your cart is empty</h4>
            <p>Explore our creations and add items to your cart to start ordering.</p>
            <button class="btn-explore-catalog" (click)="closeCartDrawer();" routerLink="/products">Browse Products</button>
          </div>

          <!-- Items list -->
          <div class="cart-items-list" *ngIf="cartItems.length > 0">
            <div class="cart-item-row" *ngFor="let item of cartItems">
              <div class="cart-item-thumb">
                <img *ngIf="item.product.images && item.product.images.length > 0" [src]="item.product.images[0]" alt="thumbnail" />
                <img *ngIf="(!item.product.images || item.product.images.length === 0) && item.product.image" [src]="item.product.image" alt="thumbnail" />
                <span *ngIf="(!item.product.images || item.product.images.length === 0) && !item.product.image">{{ item.product.icon }}</span>
              </div>
              <div class="cart-item-info">
                <h4>{{ item.product.name }}</h4>
                <span class="cart-item-code">Code: {{ item.product.code }}</span>
                <span class="cart-item-price">{{ item.product.price }}</span>
              </div>
              <div class="cart-item-qty-controls">
                <div class="qty-selector">
                  <button (click)="decrementQuantity(item)">-</button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button (click)="incrementQuantity(item)">+</button>
                </div>
                <button class="btn-remove-cart-item" (click)="removeFromCart(item.product.code)" title="Remove item">🗑️</button>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-footer" *ngIf="cartItems.length > 0">
          <div class="subtotal-row">
            <span>Subtotal:</span>
            <span class="subtotal-amount">₹{{ cartTotal.toLocaleString('en-IN') }}</span>
          </div>
          <button class="btn-checkout" (click)="openCheckout()">Proceed to Checkout</button>
        </div>
      </div>
    </div>

    <!-- OTP CHECKOUT MODAL OVERLAY -->
    <div class="checkout-modal-backdrop animate-fade-in" *ngIf="checkoutModalOpen" (click)="closeCheckout()">
      <div class="checkout-modal-card animate-scale-up" (click)="$event.stopPropagation()">
        <button class="btn-close-modal" (click)="closeCheckout()">×</button>
        
        <h3>Secure Verification</h3>
        <p class="checkout-sub">Enter your details to generate a secure OTP and place your order.</p>

        <div class="checkout-form">
          <!-- Name Input -->
          <div class="form-group">
            <label for="c-name">Full Name *</label>
            <input 
              type="text" 
              id="c-name" 
              [(ngModel)]="customerName" 
              placeholder="e.g. Varun Rajore" 
              [disabled]="otpSent" 
              required 
            />
          </div>

          <!-- Mobile Input -->
          <div class="form-group">
            <label for="c-mobile">Mobile Number *</label>
            <input 
              type="tel" 
              id="c-mobile" 
              [(ngModel)]="customerMobile" 
              placeholder="e.g. 9300545485" 
              [disabled]="otpSent" 
              required 
            />
          </div>

          <!-- Error Alert -->
          <div class="checkout-error" *ngIf="otpVerificationError">
            ⚠️ {{ otpVerificationError }}
          </div>

          <!-- Dev Mode Notice -->
          <div class="dev-otp-hint" *ngIf="!otpEnabled">
            🔧 <b>Dev Mode:</b> OTP verification is disabled. Orders place directly.
          </div>

          <!-- Send OTP Action (production / otpEnabled = true) -->
          <button 
            type="button" 
            class="btn-send-otp" 
            *ngIf="!otpSent && otpEnabled" 
            (click)="sendOtp()" 
            [disabled]="otpRequestLoading || !customerName || !customerMobile"
          >
            {{ otpRequestLoading ? 'Requesting OTP...' : 'Send Verification OTP' }}
          </button>

          <!-- Place Order directly (dev mode / otpEnabled = false) -->
          <button 
            type="button" 
            class="btn-send-otp" 
            *ngIf="!otpEnabled" 
            (click)="placeOrderWithoutOtp()" 
            [disabled]="otpVerifyLoading || !customerName || !customerMobile"
          >
            {{ otpVerifyLoading ? 'Placing Order...' : 'Place Order' }}
          </button>

          <!-- OTP Verify Segment -->
          <div class="otp-verification-section" *ngIf="otpSent && otpEnabled">
            <div class="otp-sent-banner">
              📨 OTP verification code sent to <b>{{ customerMobile }}</b>
            </div>

            <div class="form-group">
              <label for="c-otp">6-Digit Verification Code *</label>
              <input 
                type="text" 
                id="c-otp" 
                maxLength="6" 
                [(ngModel)]="otpCode" 
                placeholder="Enter 6-digit code" 
                required 
              />
            </div>

            <!-- Developer OTP Helper Hint -->
            <div class="dev-otp-hint" *ngIf="devOtpHint">
              💡 <b>Developer Test Mode OTP:</b> <span class="hint-code">{{ devOtpHint }}</span> (Check Console)
            </div>

            <div class="otp-actions">
              <button 
                type="button" 
                class="btn-verify-otp" 
                (click)="verifyOtpAndCheckout()" 
                [disabled]="otpVerifyLoading || !otpCode"
              >
                {{ otpVerifyLoading ? 'Verifying...' : 'Verify & Place Order' }}
              </button>

              <button 
                type="button" 
                class="btn-resend-otp" 
                (click)="sendOtp()" 
                [disabled]="otpCooldown > 0 || otpRequestLoading"
              >
                {{ otpCooldown > 0 ? 'Resend OTP in ' + otpCooldown + 's' : 'Resend OTP' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      transition: color var(--transition-fast);
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--primary);
    }
    .nav-cart-btn {
      background: var(--primary);
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.82rem;
      border: none;
      padding: 8px 18px;
      border-radius: 100px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 12px var(--primary-glow);
      transition: all var(--transition-fast);
    }
    .nav-cart-btn:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px var(--primary-glow);
    }
    .cart-badge {
      background: #ffffff;
      color: var(--primary);
      font-size: 0.72rem;
      font-weight: 900;
      padding: 1px 6px;
      border-radius: 100px;
      display: inline-block;
    }

    /* Hamburger & Mobile Layout */
    .hamburger-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .mobile-only-cart {
      display: none;
    }
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 22px;
      height: 16px;
      cursor: pointer;
    }
    .hamburger span {
      display: block;
      width: 100%;
      height: 2.2px;
      background: var(--text-mid);
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    .hamburger.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger.open span:nth-child(2) {
      opacity: 0;
    }
    .hamburger.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }
    .mobile-menu {
      display: none;
      flex-direction: column;
      background: #ffffff;
      border-bottom: 1.5px solid rgba(255, 107, 53, 0.12);
      padding: 1rem;
      gap: 1rem;
    }
    .mobile-menu a {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-mid);
      text-decoration: none;
    }
    .mobile-menu a.active {
      color: var(--primary);
    }

    /* FOOTER */
    .public-footer {
      background: #ffffff;
      border-top: 1.5px solid rgba(255, 107, 53, 0.12);
      padding: 3.5rem 2rem 2.5rem;
      color: var(--text-mid);
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
    }
    .footer-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 2rem;
    }
    .footer-brand h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.25rem;
      color: var(--primary);
      margin-bottom: 0.25rem;
    }
    .footer-brand p {
      font-size: 0.85rem;
      opacity: 0.7;
    }
    .footer-links {
      display: flex;
      gap: 2.25rem;
      font-size: 0.88rem;
      font-weight: 700;
    }
    .footer-links a {
      color: var(--text-mid);
      text-decoration: none;
      transition: color var(--transition-fast);
    }
    .footer-links a:hover {
      color: var(--primary);
    }
    .admin-link-badge {
      background: rgba(255, 107, 53, 0.08);
      border: 1px solid rgba(255, 107, 53, 0.2);
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

    /* SLIDE-OUT CART DRAWER */
    .cart-drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      z-index: 5000;
      display: flex;
      justify-content: flex-end;
    }
    .cart-drawer {
      width: 440px;
      max-width: 100%;
      height: 100%;
      background: #ffffff;
      box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .drawer-header {
      padding: 1.5rem;
      border-bottom: 1.5px solid rgba(255, 107, 53, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .drawer-header h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.2rem;
      color: var(--text-dark);
    }
    .btn-close-drawer {
      background: transparent;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: var(--text-light);
      transition: color 0.2s;
      line-height: 1;
    }
    .btn-close-drawer:hover {
      color: var(--primary);
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    .empty-cart-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 80%;
      color: var(--text-light);
    }
    .empty-cart-icon {
      font-size: 3.5rem;
      margin-bottom: 1.25rem;
      opacity: 0.6;
    }
    .empty-cart-state h4 {
      font-family: 'Outfit', sans-serif;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }
    .empty-cart-state p {
      font-size: 0.85rem;
      max-width: 250px;
      margin-bottom: 1.5rem;
    }
    .btn-explore-catalog {
      background: var(--primary);
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      border: none;
      padding: 10px 24px;
      border-radius: 100px;
      cursor: pointer;
    }
    
    /* Cart list items */
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .cart-item-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 107, 53, 0.06);
    }
    .cart-item-thumb {
      width: 64px;
      height: 64px;
      border-radius: 14px;
      overflow: hidden;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      border: 1px solid rgba(255, 107, 53, 0.08);
      flex-shrink: 0;
    }
    .cart-item-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cart-item-info {
      flex: 1;
    }
    .cart-item-info h4 {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-dark);
      margin-bottom: 0.15rem;
    }
    .cart-item-code {
      display: block;
      font-size: 0.75rem;
      color: var(--text-light);
      margin-bottom: 0.25rem;
    }
    .cart-item-price {
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--primary);
    }
    
    .cart-item-qty-controls {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }
    .qty-selector {
      display: flex;
      align-items: center;
      border: 1px solid rgba(255, 107, 53, 0.18);
      border-radius: 100px;
      overflow: hidden;
      background: #ffffff;
    }
    .qty-selector button {
      background: transparent;
      border: none;
      width: 26px;
      height: 26px;
      cursor: pointer;
      font-weight: 800;
      font-size: 0.9rem;
      color: var(--text-mid);
      transition: background 0.2s;
    }
    .qty-selector button:hover {
      background: var(--primary-light);
      color: var(--primary);
    }
    .qty-value {
      font-size: 0.8rem;
      font-weight: 800;
      padding: 0 6px;
      color: var(--text-dark);
    }
    .btn-remove-cart-item {
      background: transparent;
      border: none;
      cursor: pointer;
      opacity: 0.6;
      font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .btn-remove-cart-item:hover {
      opacity: 1;
    }

    .drawer-footer {
      padding: 1.5rem;
      border-top: 1.5px solid rgba(255, 107, 53, 0.1);
      background: var(--cream);
    }
    .subtotal-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-dark);
    }
    .subtotal-amount {
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--primary);
    }
    .btn-checkout {
      width: 100%;
      background: linear-gradient(135deg, var(--primary) 0%, hsl(14, 90%, 55%) 100%);
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.95rem;
      padding: 14px;
      border: none;
      border-radius: 100px;
      cursor: pointer;
      box-shadow: 0 4px 12px var(--primary-glow);
      transition: all var(--transition-fast);
      text-align: center;
    }
    .btn-checkout:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px var(--primary-glow);
    }

    /* OTP CHECKOUT MODAL */
    .checkout-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(18, 18, 18, 0.55);
      backdrop-filter: blur(8px);
      z-index: 6000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .checkout-modal-card {
      background: #ffffff;
      border-radius: 28px;
      width: 460px;
      max-width: 100%;
      padding: 2.25rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 107, 53, 0.08);
      position: relative;
    }
    .checkout-modal-card h3 {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      color: var(--text-dark);
      margin-bottom: 0.25rem;
    }
    .checkout-sub {
      font-size: 0.85rem;
      color: var(--text-light);
      margin-bottom: 1.75rem;
    }
    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .checkout-form label {
      display: block;
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--text-mid);
      margin-bottom: 0.4rem;
    }
    .checkout-form input {
      width: 100%;
      background: rgba(255, 107, 53, 0.02);
      border: 1.5px solid rgba(255, 107, 53, 0.15);
      border-radius: 12px;
      padding: 12px 16px;
      font-family: inherit;
      font-size: 0.9rem;
      color: var(--text-dark);
      transition: all 0.2s;
    }
    .checkout-form input:focus {
      border-color: var(--primary);
      background: #ffffff;
      outline: none;
      box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
    }
    .checkout-form input:disabled {
      opacity: 0.55;
      background: #f5f5f5;
    }
    
    .checkout-error {
      background: #fff3ee;
      border: 1px solid rgba(255, 107, 53, 0.25);
      color: var(--primary);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .btn-send-otp {
      background: var(--primary);
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.9rem;
      padding: 12px;
      border: none;
      border-radius: 100px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px var(--primary-glow);
    }
    .btn-send-otp:hover:not(:disabled) {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .btn-send-otp:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* OTP verify panel */
    .otp-verification-section {
      border-top: 1.5px dashed rgba(255, 107, 53, 0.15);
      padding-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .otp-sent-banner {
      font-size: 0.8rem;
      color: var(--text-mid);
    }
    .dev-otp-hint {
      font-size: 0.78rem;
      background: #eef9ff;
      border: 1px solid #bce1f5;
      color: #1e75a6;
      padding: 8px 12px;
      border-radius: 8px;
    }
    .hint-code {
      font-family: monospace;
      font-weight: 900;
      background: #ffffff;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #a3d4f0;
    }

    .otp-actions {
      display: flex;
      gap: 0.75rem;
    }
    .btn-verify-otp {
      flex: 2;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.9rem;
      padding: 12px;
      border: none;
      border-radius: 100px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      transition: all 0.2s;
    }
    .btn-verify-otp:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
    }
    .btn-resend-otp {
      flex: 1;
      background: #ffffff;
      border: 1.5px solid rgba(255, 107, 53, 0.25);
      color: var(--text-mid);
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 0.78rem;
      border-radius: 100px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-resend-otp:hover:not(:disabled) {
      border-color: var(--primary);
      color: var(--primary);
    }
    .btn-resend-otp:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Media queries */
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
      .mobile-only-cart {
        display: flex;
      }
      .mobile-menu.open {
        display: flex;
      }
      nav {
        padding: 0 1.25rem;
      }
      .cart-drawer {
        width: 100%;
      }
    }
  `]
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;

  // Cart State
  cartDrawerOpen = false;
  cartItems: CartItem[] = [];
  cartCount = 0;
  cartTotal = 0;
  private subs = new Subscription();

  // Checkout State
  checkoutModalOpen = false;
  customerName = '';
  customerMobile = '';
  otpSent = false;
  otpCode = '';
  otpVerificationError = '';
  otpRequestLoading = false;
  otpVerifyLoading = false;
  otpCooldown = 0;
  private cooldownInterval: any;

  // Dev OTP code hint
  devOtpHint = '';

  // 🔧 Feature flag: when false, checkout skips OTP entirely (local dev only)
  otpEnabled = environment.otpEnabled;

  constructor(
    private cartService: CartService,
    private authOtpService: AuthOtpService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.subs.add(
      this.cartService.cartItems$.subscribe(items => this.cartItems = items)
    );
    this.subs.add(
      this.cartService.cartCount$.subscribe(count => this.cartCount = count)
    );
    this.subs.add(
      this.cartService.cartTotal$.subscribe(total => this.cartTotal = total)
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  toggleCartDrawer() {
    this.cartDrawerOpen = !this.cartDrawerOpen;
  }

  closeCartDrawer() {
    this.cartDrawerOpen = false;
  }

  removeFromCart(code: string) {
    this.cartService.removeFromCart(code);
  }

  incrementQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.product.code, item.quantity + 1);
  }

  decrementQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.product.code, item.quantity - 1);
  }

  openCheckout() {
    this.closeCartDrawer();
    this.checkoutModalOpen = true;
    this.otpSent = false;
    this.otpCode = '';
    this.otpVerificationError = '';
    this.devOtpHint = '';
  }

  closeCheckout() {
    this.checkoutModalOpen = false;
  }

  async sendOtp() {
    if (!this.customerName || !this.customerMobile) {
      this.otpVerificationError = 'Please enter your name and mobile number.';
      return;
    }
    this.otpRequestLoading = true;
    this.otpVerificationError = '';
    
    const res = await this.authOtpService.requestOtp(this.customerMobile);
    this.otpRequestLoading = false;

    if (res.success) {
      this.otpSent = true;
      this.startCooldown();
      if (res.mockOtp) {
        this.devOtpHint = res.mockOtp;
      }
    } else {
      this.otpVerificationError = res.message;
    }
  }

  async verifyOtpAndCheckout() {
    if (!this.otpCode) {
      this.otpVerificationError = 'Please enter the 6-digit OTP code.';
      return;
    }
    this.otpVerifyLoading = true;
    this.otpVerificationError = '';

    const verified = await this.authOtpService.verifyOtp(this.customerMobile, this.otpCode);
    
    if (verified) {
      await this.placeOrder('OTP verified, but order logging failed: ');
    } else {
      this.otpVerifyLoading = false;
      this.otpVerificationError = 'Invalid or expired OTP. Please try again.';
    }
  }

  /**
   * 🔧 Dev-mode checkout path (otpEnabled = false): skips OTP entirely,
   * still requires Full Name + Mobile so customer records stay consistent.
   * Never reachable when environment.otpEnabled is true.
   */
  async placeOrderWithoutOtp() {
    if (this.otpEnabled) return; // safety guard — dev path only
    if (!this.customerName || !this.customerMobile) {
      this.otpVerificationError = 'Please enter your name and mobile number.';
      return;
    }
    this.otpVerifyLoading = true;
    this.otpVerificationError = '';
    console.warn('[SI] OTP verification is DISABLED (dev mode) — placing order without OTP.');
    await this.placeOrder('Order logging failed: ');
  }

  /**
   * Shared order-placement logic used by both the verified-OTP path
   * and the dev-mode no-OTP path.
   */
  private async placeOrder(errorPrefix: string) {
    try {
      const itemsPayload = this.cartItems.map(item => ({
        code: item.product.code,
        name: item.product.name,
        price: item.product.price,
        qty: item.quantity,
        image: item.product.images?.[0] || item.product.image || ''
      }));

      const formattedTotal = '₹' + this.cartTotal.toLocaleString('en-IN');

      // Store customer details and order records
      await this.supabaseService.createCustomerAndOrder(
        { name: this.customerName, mobile: this.customerMobile },
        itemsPayload,
        formattedTotal
      );

      // Clear local storage cart
      const savedItemsForLink = [...this.cartItems];
      this.cartService.clearCart();
      this.checkoutModalOpen = false;

      // Redirect to WhatsApp with order summary
      const waLink = this.buildWhatsAppCartLink(savedItemsForLink, formattedTotal);
      window.open(waLink, '_blank');

    } catch (err: any) {
      console.error('Order creation error:', err);
      this.otpVerificationError = errorPrefix + (err.message || err);
    } finally {
      this.otpVerifyLoading = false;
    }
  }

  private startCooldown() {
    this.otpCooldown = 60;
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
    this.cooldownInterval = setInterval(() => {
      this.otpCooldown--;
      if (this.otpCooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  private buildWhatsAppCartLink(items: CartItem[], total: string): string {
    let itemsText = '';
    items.forEach((item, idx) => {
      itemsText += `${idx + 1}. *${item.product.name}* (Code: ${item.product.code})\n   Qty: ${item.quantity} × ${item.product.price}\n\n`;
    });

    const message = `Hi! I want to order the following items from my cart:\n\n${itemsText}*Total Amount:* ${total}\n\n*Customer Details:*\nName: ${this.customerName}\nMobile: ${this.customerMobile}\n\nPlease confirm availability and details.`;
    return `https://wa.me/919300545485?text=${encodeURIComponent(message)}`;
  }
}
