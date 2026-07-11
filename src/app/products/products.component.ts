import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SupabaseService, Product, Category } from '../core/services/supabase.service';
import { SeoService } from '../core/services/seo.service';
import { CartService } from '../core/services/cart.service';
import { AssetUrlPipe } from '../core/pipes/asset-url.pipe';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, AssetUrlPipe],
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
    private supabaseService: SupabaseService,
    private seoService: SeoService,
    private cartService: CartService,
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.seoService.generateTags({
      title: 'Creations Catalog & Custom Gifts',
      description: 'Explore custom backlit LED name plates, wooden name boards, magic photo standees, magic mirrors, handmade sketches, customized metal rakhis, and glossy trophies in Jabalpur.',
      keywords: 'name plates jabalpur, led name plates, photo standees, magic mirror jabalpur, customized gifts list',
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Custom Gift Creations Catalog - Spiritual Imagination",
        "description": "Premium handcrafted name plates, LED photo standees, trophies, metal rakhis, and custom mugs in Jabalpur.",
        "publisher": {
          "@type": "Organization",
          "name": "Spiritual Imagination",
          "url": "https://sidesigns.netlify.app"
        }
      }
    });

    this.loadCategories();
    this.loadProducts();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  loadCategories() {
    this.supabaseService.getCategories().then(data => {
      this.categoriesData = data;
      this.categories = ['All', ...this.categoriesData.map(c => c.name)];
      this.filterByCategory(this.selectedCategory);
    }).catch(err => {
      console.error('Error parsing categories from Supabase', err);
    });
  }

  loadProducts() {
    this.supabaseService.getProducts().then(data => {
      this.products = data;
      this.applyFilters();
      
      // Auto-open modal if code param is present
      if (isPlatformBrowser(this.platformId)) {
        const urlParams = new URLSearchParams(window.location.search);
        const codeParam = urlParams.get('code');
        if (codeParam) {
          const matched = this.products.find(p => p.code.toLowerCase() === codeParam.toLowerCase());
          if (matched) {
            this.openProductModal(matched);
          }
        }
      }
    }).catch(err => {
      console.error('Error parsing products from Supabase', err);
    });
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

  // Toast State
  addedToCartCode: string | null = null;
  private toastTimeout: any;

  addToCart(product: Product, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.cartService.addToCart(product, 1);
    
    // Show toast message
    this.addedToCartCode = product.code;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.addedToCartCode = null;
    }, 2500);
  }

  // Modal Handlers
  openProductModal(product: Product) {
    this.selectedProduct = product;
    this.activeImageIndex = 0;

    // Update SEO dynamically for product sharing link rich unfurl
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://sidesigns.netlify.app';
    const images = this.getProductImages();
    const firstImg = images.length > 0 ? images[0] : 'https://sidesigns.netlify.app/assets/logo.png';

    this.seoService.generateTags({
      title: `${product.name} (Code: ${product.code})`,
      description: `Buy ${product.name} online. Price: ${product.price} | Size: ${product.size}. ${product.desc || ''}`,
      image: firstImg,
      url: `${currentOrigin}/products?code=${product.code}`,
      type: 'product',
      schema: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": firstImg,
        "description": product.desc,
        "sku": product.code,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": product.price.replace(/[^\d]/g, ''),
          "availability": "https://schema.org/InStock",
          "url": `${currentOrigin}/products?code=${product.code}`
        }
      }
    });
  }

  closeProductModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedProduct = null;

    // Restore Catalog default SEO tags
    this.seoService.generateTags({
      title: 'Creations Catalog & Custom Gifts',
      description: 'Explore custom backlit LED name plates, wooden name boards, magic photo standees, magic mirrors, handmade sketches, customized metal rakhis, and glossy trophies in Jabalpur.',
      keywords: 'name plates jabalpur, led name plates, photo standees, magic mirror jabalpur, customized gifts list',
      schema: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Custom Gift Creations Catalog - Spiritual Imagination",
        "description": "Premium handcrafted name plates, LED photo standees, trophies, metal rakhis, and custom mugs in Jabalpur.",
        "publisher": {
          "@type": "Organization",
          "name": "Spiritual Imagination",
          "url": "https://sidesigns.netlify.app"
        }
      }
    });
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

  getWhatsAppLink(product: Product) {
    const name = product.name;
    const code = product.code;
    const price = product.price;

    let imagePart = '';
    if (product.images && product.images.length > 0) {
      const firstImg = product.images[0];
      if (firstImg.startsWith('http')) {
        imagePart = `\n🖼️ *Image Link:* ${firstImg}`;
      }
    } else if (product.image && product.image.startsWith('http')) {
      imagePart = `\n🖼️ *Image Link:* ${product.image}`;
    }

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://sidesigns.netlify.app';
    const detailLink = `\n🔗 *View Details:* ${currentOrigin}/products?code=${code}`;

    const message = `Hi! I'm interested in ordering:\n\n*Product:* ${name}\n*Code:* ${code}\n*Price:* ${price}${imagePart}${detailLink}\n\nPlease share personalization options and details.`;
    return `https://wa.me/919209636699?text=${encodeURIComponent(message)}`;
  }
}
