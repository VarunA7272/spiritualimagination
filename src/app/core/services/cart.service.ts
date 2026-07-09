import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './supabase.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  private cartTotalSubject = new BehaviorSubject<number>(0);
  cartTotal$ = this.cartTotalSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private saveCart(items: CartItem[]) {
    this.cartItemsSubject.next(items);
    this.updateTotals(items);
    
    if (this.isBrowser()) {
      localStorage.setItem('si_cart', JSON.stringify(items));
    }
  }

  private loadCart() {
    if (this.isBrowser()) {
      const stored = localStorage.getItem('si_cart');
      if (stored) {
        try {
          const items: CartItem[] = JSON.parse(stored);
          this.cartItemsSubject.next(items);
          this.updateTotals(items);
        } catch (e) {
          console.error('Error parsing cart from localStorage', e);
          this.saveCart([]);
        }
      }
    }
  }

  private updateTotals(items: CartItem[]) {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(count);

    const total = items.reduce((sum, item) => {
      const price = this.parsePrice(item.product.price);
      return sum + (price * item.quantity);
    }, 0);
    this.cartTotalSubject.next(total);
  }

  private parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    // Remove currency symbols, commas, and other formatting characters
    const clean = priceStr.replace(/[^\d.]/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addToCart(product: Product, quantity = 1) {
    const current = this.getCartItems();
    const existing = current.find(item => item.product.code === product.code);

    if (existing) {
      existing.quantity += quantity;
      this.saveCart([...current]);
    } else {
      this.saveCart([...current, { product, quantity }]);
    }
  }

  removeFromCart(productCode: string) {
    const current = this.getCartItems();
    const updated = current.filter(item => item.product.code !== productCode);
    this.saveCart(updated);
  }

  updateQuantity(productCode: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productCode);
      return;
    }
    const current = this.getCartItems();
    const item = current.find(item => item.product.code === productCode);
    if (item) {
      item.quantity = quantity;
      this.saveCart([...current]);
    }
  }

  clearCart() {
    this.saveCart([]);
  }
}
