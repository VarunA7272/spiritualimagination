import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../core/services/seo.service';
import { SupabaseService, Product, FeaturedSlide, Category } from '../core/services/supabase.service';
import { AssetUrlPipe } from '../core/pipes/asset-url.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, AssetUrlPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  typingWord = '';
  private words = ['Custom Mugs', 'Personalized Gifts', 'T-Shirt Printing', 'Trophies & Awards', 'MDF Art'];
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingTimer: any;

  hangingCards = [
    { name: 'Name Plates', icon: '🏷️', left: 8, delay: '0s', length: 160 },
    { name: 'LED Frames', icon: '🖼️', left: 24, delay: '0.6s', length: 230 },
    { name: 'Sketches', icon: '✏️', left: 74, delay: '1.4s', length: 190 },
    { name: 'Metal Rakhis', icon: '📿', left: 88, delay: '0.9s', length: 250 }
  ];

  // Featured Carousel State
  featuredProducts: FeaturedSlide[] = [];
  activeSlideIndex = 0;
  private autoplayTimer: any;

  // Categories
  categories: Category[] = [];

  constructor(
    private seoService: SeoService,
    private supabaseService: SupabaseService,
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.seoService.generateTags({
      title: 'Spiritual Imagination 🎁 — Custom Gifts Jabalpur',
      description: 'Crafting premium personalized gifts in Jabalpur. Custom backlit LED name plates, magic photo mirrors, handmade pencil sketches, personalized trophies, corporate mugs, and custom metallic rakhis.',
      keywords: 'custom gifts jabalpur, personalized gifts, custom backlit name plates, trophies, awards, corporate gifting',
      schema: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://sidesigns.netlify.app/#organization",
            "name": "Spiritual Imagination",
            "url": "https://sidesigns.netlify.app",
            "logo": "https://sidesigns.netlify.app/favicon.ico",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "805, Wright Town",
              "addressLocality": "Jabalpur",
              "addressRegion": "Madhya Pradesh",
              "postalCode": "482002",
              "addressCountry": "IN"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+919209636699",
              "contactType": "sales",
              "areaServed": "IN",
              "availableLanguage": ["en", "hi"]
            }
          },
          {
            "@type": "WebSite",
            "@id": "https://sidesigns.netlify.app/#website",
            "url": "https://sidesigns.netlify.app/",
            "name": "Spiritual Imagination",
            "publisher": {
              "@id": "https://sidesigns.netlify.app/#organization"
            }
          }
        ]
      }
    });

    this.loadFeaturedProducts();
    this.loadCategories();

    if (isPlatformBrowser(this.platformId)) {
      this.startTyping();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  ngOnDestroy() {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    this.stopAutoplay();
  }

  loadFeaturedProducts() {
    this.supabaseService.getFeaturedSlides().then(slides => {
      if (slides && slides.length > 0) {
        this.featuredProducts = slides;
        if (isPlatformBrowser(this.platformId)) {
          this.startAutoplay();
        }
      } else {
        // Fallback: Query products marked as featured
        this.supabaseService.getFeaturedProducts().then(products => {
          if (products && products.length > 0) {
            this.featuredProducts = products.map(p => ({
              title: p.name,
              category: p.category + (p.subcategory ? ' / ' + p.subcategory : ''),
              description: p.desc || 'Handcrafted customized gift matching your requirements.',
              price: p.price,
              product_code: p.code,
              image_url: p.images?.[0] || p.image || ''
            }));
            if (isPlatformBrowser(this.platformId)) {
              this.startAutoplay();
            }
          } else {
            // Second Fallback: mock slides
            this.loadFallbackProducts();
            if (isPlatformBrowser(this.platformId)) {
              this.startAutoplay();
            }
          }
        }).catch(err => {
          console.error('Error loading fallback products:', err);
          this.loadFallbackProducts();
          if (isPlatformBrowser(this.platformId)) {
            this.startAutoplay();
          }
        });
      }
    }).catch(err => {
      console.error('Error loading featured slides, trying fallback:', err);
      this.loadFallbackProducts();
      if (isPlatformBrowser(this.platformId)) {
        this.startAutoplay();
      }
    });
  }

  loadCategories() {
    this.supabaseService.getCategories().then(data => {
      this.categories = data;
      // Re-run animations to observe newly rendered categories
      setTimeout(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.initScrollAnimations();
        }
      }, 100);
    }).catch(err => console.error('Error loading categories on home:', err));
  }

  loadFallbackProducts() {
    this.featuredProducts = [
      {
        title: 'Premium Backlit LED Name Plate',
        category: 'Name Plates',
        price: '₹2,400',
        description: 'Indoors/Outdoors water-resistant personalized acrylic name plate with gold lettering and warm LED backlight.',
        product_code: 'NP-01',
        image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Magic Photo Mirror Frame',
        category: 'LED & Photo Frames',
        price: '₹1,200',
        description: 'Acts as a mirror, but lights up to show your photo when turned on. Touch control USB powered.',
        product_code: 'MM-02',
        image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
      },
      {
        title: 'Handmade Realistic Pencil Sketch',
        category: 'Sketches & Paintings',
        price: '₹1,800',
        description: '100% handmade realistic charcoal portrait from your photo. Includes premium black wooden frame.',
        product_code: 'SK-03',
        image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80'
      }
    ];
  }

  startTyping() {
    const currentWord = this.words[this.wordIndex];
    if (!this.isDeleting) {
      this.typingWord = currentWord.slice(0, ++this.charIndex);
      if (this.charIndex === currentWord.length) {
        this.isDeleting = true;
        this.typingTimer = setTimeout(() => this.startTyping(), 2000);
        return;
      }
    } else {
      this.typingWord = currentWord.slice(0, --this.charIndex);
      if (this.charIndex === 0) {
        this.isDeleting = false;
        this.wordIndex = (this.wordIndex + 1) % this.words.length;
        this.typingTimer = setTimeout(() => this.startTyping(), 400);
        return;
      }
    }
    this.typingTimer = setTimeout(() => this.startTyping(), this.isDeleting ? 60 : 90);
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    const fadeElements = this.elRef.nativeElement.querySelectorAll('.fade-up');
    fadeElements.forEach((el: HTMLElement, i: number) => {
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      observer.observe(el);
    });
  }

  // Carousel Handlers
  startAutoplay() {
    this.stopAutoplay();
    if (isPlatformBrowser(this.platformId) && this.featuredProducts.length > 1) {
      this.autoplayTimer = setInterval(() => {
        this.nextSlide();
      }, 4500);
    }
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  nextSlide() {
    if (this.featuredProducts.length === 0) return;
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.featuredProducts.length;
  }

  prevSlide() {
    if (this.featuredProducts.length === 0) return;
    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.featuredProducts.length) % this.featuredProducts.length;
  }

  setSlide(idx: number) {
    this.activeSlideIndex = idx;
    this.startAutoplay();
  }
}
