import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Category {
  name: string;
  subcategories: string[];
}

interface Product {
  name: string;
  category: string;
  subcategory?: string;
  size: string;
  price: string;
  desc: string;
  code: string;
  icon: string;
  image?: string;
  images?: string[];
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, AfterViewInit {
  categoriesData: Category[] = [];
  categories: string[] = ['All'];
  selectedCategory = 'All';

  subcategories: string[] = [];
  selectedSubcategory = 'All';

  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Modal State
  selectedProduct: Product | null = null;
  activeImageIndex = 0;

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
    this.filterByCategory('All');
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  loadCategories() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = localStorage.getItem('si_categories');
    if (saved) {
      try {
        this.categoriesData = JSON.parse(saved);
        this.categories = ['All', ...this.categoriesData.map(c => c.name)];
      } catch (err) {
        console.error('Error parsing categories', err);
        this.loadDefaultCategories();
      }
    } else {
      this.loadDefaultCategories();
    }
  }

  loadDefaultCategories() {
    this.categoriesData = [
      { name: 'Name Plates', subcategories: ['Acrylic', 'LED Backlit', 'Wooden', 'MDF Board'] },
      { name: 'LED & Photo Frames', subcategories: ['Magic Mirrors', 'Couple Standees', 'Collage Frames', 'Canvas Frames'] },
      { name: 'Sketches & Paintings', subcategories: ['Pencil Sketches', 'Oil Paintings', 'Acrylic Canvas'] },
      { name: 'Metal Rakhis', subcategories: ['Name Rakhis', 'Photo Rakhis'] },
      { name: 'Mugs & Gifting', subcategories: ['Custom Mugs', 'Photo Cushions'] }
    ];
    this.categories = ['All', ...this.categoriesData.map(c => c.name)];
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('si_categories', JSON.stringify(this.categoriesData));
    }
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
      { name: 'Acrylic Golden Name Plate', category: 'Name Plates', subcategory: 'Acrylic', size: '15x24 Inch', price: '₹1,800', desc: 'Premium acrylic base with metallic golden letters.', code: 'JZZ4501', icon: '🏷️' },
      { name: 'Basuri Vadak Name Plate', category: 'Name Plates', subcategory: 'Wooden', size: '8x15 Inch', price: '₹1,000', desc: 'Beautiful flute theme wooden-finish acrylic plate.', code: 'GZZ4801', icon: '🏷️' },
      { name: 'Glowing LED Name Plate', category: 'Name Plates', subcategory: 'LED Backlit', size: '6x12 Inch', price: '₹1,000', desc: 'Warm backlit LED plate with custom engravings.', code: 'GZZ4802', icon: '💡' },
      { name: 'MDF Family Name Plate', category: 'Name Plates', subcategory: 'MDF Board', size: '6x12 Inch', price: '₹400', desc: 'Elegant laser-cut MDF wooden name board.', code: 'BEZ4501', icon: '🪵' },
      { name: 'LED Mirror Photo Frame', category: 'LED & Photo Frames', subcategory: 'Magic Mirrors', size: '12x18 Inch', price: '₹999', desc: 'Magic mirror with LED lights showing custom photo.', code: 'FZZ-2', icon: '🪞' },
      { name: 'Acrylic Couple Standee Frame', category: 'LED & Photo Frames', subcategory: 'Couple Standees', size: '12x18 Inch', price: '₹900', desc: 'High gloss acrylic cutout frame with photo prints.', code: 'BZZ-12', icon: '🖼️' },
      { name: 'Lamination Collage Frame', category: 'LED & Photo Frames', subcategory: 'Collage Frames', size: '8x12 Inch', price: '₹250', desc: 'Wooden collage lamination with multiple photos.', code: 'AZZ-1', icon: '🖼️' },
      { name: 'Canvas Frame Set', category: 'LED & Photo Frames', subcategory: 'Canvas Frames', size: '8x12 Inch', price: '₹350', desc: 'Decorative canvas painting print setup.', code: 'BZZ-1', icon: '🖼️' },
      { name: 'Handmade Pencil Sketch (Single)', category: 'Sketches & Paintings', subcategory: 'Pencil Sketches', size: '8x12 Inch', price: '₹500', desc: 'Realistic pencil drawing by our skilled artists.', code: 'SK-01', icon: '✏️' },
      { name: 'Pencil Sketch (Couple)', category: 'Sketches & Paintings', subcategory: 'Pencil Sketches', size: '12x18 Inch', price: '₹1,500', desc: 'Beautiful couple portrait handmade sketch.', code: 'SK-02', icon: '✏️' },
      { name: 'Canvas Oil Painting', category: 'Sketches & Paintings', subcategory: 'Oil Paintings', size: '12x18 Inch', price: '₹5,000', desc: 'Original acrylic/oil custom canvas painting.', code: 'SK-03', icon: '🎨' },
      { name: 'Engraved Metal Name Rakhi', category: 'Metal Rakhis', subcategory: 'Name Rakhis', size: 'Standard', price: '₹130', desc: 'Premium metal rakhi personalized with name.', code: 'RK-01', icon: '📿' },
      { name: 'Custom Photo Rakhi', category: 'Metal Rakhis', subcategory: 'Photo Rakhis', size: 'Standard', price: '₹120', desc: 'Photo printed rakhi with colorful threads.', code: 'RK-02', icon: '📿' },
      { name: 'Custom Printed Mug', category: 'Mugs & Gifting', subcategory: 'Custom Mugs', size: 'Standard 330ml', price: '₹250', desc: 'Glossy ceramic photo mug with custom layout.', code: 'MG-01', icon: '☕' },
      { name: 'Personalized Photo Cushion', category: 'Mugs & Gifting', subcategory: 'Photo Cushions', size: '12x12 Inch', price: '₹350', desc: 'Fluffy printed cushion for home and gifting.', code: 'CS-01', icon: '🛋️' }
    ];
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('si_products', JSON.stringify(this.products));
    }
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.selectedSubcategory = 'All';

    if (category === 'All') {
      this.subcategories = [];
    } else {
      const catObj = this.categoriesData.find(c => c.name === category);
      this.subcategories = catObj ? catObj.subcategories : [];
    }

    this.applyFilters();
  }

  filterBySubcategory(subcategory: string) {
    this.selectedSubcategory = subcategory;
    this.applyFilters();
  }

  applyFilters() {
    let result = this.products;

    if (this.selectedCategory !== 'All') {
      result = result.filter(p => p.category === this.selectedCategory);

      if (this.selectedSubcategory !== 'All') {
        result = result.filter(p => p.subcategory === this.selectedSubcategory);
      }
    }

    this.filteredProducts = result;

    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initScrollAnimations();
      }
    }, 50);
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    const fadeElements = this.elRef.nativeElement.querySelectorAll('.fade-up');
    fadeElements.forEach((el: HTMLElement, i: number) => {
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      observer.observe(el);
    });
  }

  // Modal Handlers
  openProductModal(product: Product) {
    this.selectedProduct = product;
    this.activeImageIndex = 0;
  }

  closeProductModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedProduct = null;
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (!this.selectedProduct) return;
    const imagesCount = this.getProductImages().length;
    if (imagesCount > 0) {
      this.activeImageIndex = (this.activeImageIndex + 1) % imagesCount;
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    if (!this.selectedProduct) return;
    const imagesCount = this.getProductImages().length;
    if (imagesCount > 0) {
      this.activeImageIndex = (this.activeImageIndex - 1 + imagesCount) % imagesCount;
    }
  }

  setCurrentImage(idx: number, event: Event) {
    event.stopPropagation();
    this.activeImageIndex = idx;
  }

  getProductImages(): string[] {
    if (!this.selectedProduct) return [];
    if (this.selectedProduct.images && this.selectedProduct.images.length > 0) {
      return this.selectedProduct.images;
    }
    if (this.selectedProduct.image) {
      return [this.selectedProduct.image];
    }
    return [];
  }

  getWhatsAppLink(productName: string, productCode: string) {
    const message = `Hi! I'm interested in ordering the ${productName} (Code: ${productCode}). Please share details.`;
    return `https://wa.me/919300545485?text=${encodeURIComponent(message)}`;
  }
}
