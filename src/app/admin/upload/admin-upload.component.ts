import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  name: string;
  category: string;
  size: string;
  price: string;
  desc: string;
  code: string;
  icon: string;
}

@Component({
  selector: 'app-admin-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-upload.component.html',
  styleUrls: ['./admin-upload.component.css']
})
export class AdminUploadComponent implements OnInit {
  categories = ['Name Plates', 'LED & Photo Frames', 'Sketches & Paintings', 'Metal Rakhis', 'Mugs & Gifting'];
  icons = [
    { label: 'Label/Tag', value: '🏷️' },
    { label: 'Light/LED', value: '💡' },
    { label: 'Wood/MDF', value: '🪵' },
    { label: 'Mirror', value: '🪞' },
    { label: 'Picture Frame', value: '🖼️' },
    { label: 'Pencil', value: '✏️' },
    { label: 'Art Palette', value: '🎨' },
    { label: 'Rakhi Thread', value: '📿' },
    { label: 'Coffee Mug', value: '☕' },
    { label: 'Cushion/Pillow', value: '🛋️' }
  ];

  // Form Model
  name = '';
  category = 'Name Plates';
  size = '';
  price = '';
  desc = '';
  code = '';
  selectedIcon = '🏷️';

  // State
  products: Product[] = [];
  successMessage = '';
  errorMessage = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem('si_products');
    if (saved) {
      try {
        this.products = JSON.parse(saved);
      } catch (err) {
        console.error('Error parsing saved products', err);
        this.loadDefaultProducts();
      }
    } else {
      this.loadDefaultProducts();
    }
  }

  loadDefaultProducts() {
    this.products = [
      { name: 'Acrylic Golden Name Plate', category: 'Name Plates', size: '15x24 Inch', price: '₹1,800', desc: 'Premium acrylic base with metallic golden letters.', code: 'JZZ4501', icon: '🏷️' },
      { name: 'Basuri Vadak Name Plate', category: 'Name Plates', size: '8x15 Inch', price: '₹1,000', desc: 'Beautiful flute theme wooden-finish acrylic plate.', code: 'GZZ4801', icon: '🏷️' },
      { name: 'Glowing LED Name Plate', category: 'Name Plates', size: '6x12 Inch', price: '₹1,000', desc: 'Warm backlit LED plate with custom engravings.', code: 'GZZ4801', icon: '💡' },
      { name: 'LED Mirror Photo Frame', category: 'LED & Photo Frames', size: '12x18 Inch', price: '₹999', desc: 'Magic mirror with LED lights showing custom photo.', code: 'FZZ-2', icon: '🪞' },
      { name: 'Handmade Pencil Sketch (Single)', category: 'Sketches & Paintings', size: '8x12 Inch', price: '₹500', desc: 'Realistic pencil drawing by our skilled artists.', code: 'SK-01', icon: '✏️' },
      { name: 'Engraved Metal Name Rakhi', category: 'Metal Rakhis', size: 'Standard', price: '₹130', desc: 'Premium metal rakhi personalized with name.', code: 'RK-01', icon: '📿' }
    ];
    this.saveToStorage();
  }

  saveToStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('si_products', JSON.stringify(this.products));
    }
  }

  onSubmit() {
    if (!this.name || !this.size || !this.price || !this.code) {
      this.errorMessage = 'Please fill out all required fields.';
      return;
    }

    // Check if code already exists
    if (this.products.some(p => p.code.toLowerCase() === this.code.trim().toLowerCase())) {
      this.errorMessage = `A product with code "${this.code.trim()}" already exists.`;
      return;
    }

    const newProduct: Product = {
      name: this.name.trim(),
      category: this.category,
      size: this.size.trim(),
      price: this.price.startsWith('₹') ? this.price.trim() : '₹' + this.price.trim(),
      desc: this.desc.trim(),
      code: this.code.trim().toUpperCase(),
      icon: this.selectedIcon
    };

    this.products.unshift(newProduct);
    this.saveToStorage();

    // Reset Form
    this.name = '';
    this.size = '';
    this.price = '';
    this.desc = '';
    this.code = '';
    this.selectedIcon = '🏷️';
    this.errorMessage = '';

    this.successMessage = '✓ Product uploaded successfully!';
    setTimeout(() => (this.successMessage = ''), 3500);
  }

  deleteProduct(code: string) {
    if (confirm(`Are you sure you want to delete product "${code}"?`)) {
      this.products = this.products.filter(p => p.code !== code);
      this.saveToStorage();
    }
  }
}
