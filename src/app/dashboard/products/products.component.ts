import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit, AfterViewInit {
  categories = ['All', 'Name Plates', 'LED & Photo Frames', 'Sketches & Paintings', 'Metal Rakhis', 'Mugs & Gifting'];
  selectedCategory = 'All';

  products = [
    // Name Plates
    { name: 'Acrylic Golden Name Plate', category: 'Name Plates', size: '15x24 Inch', price: '₹1,800', desc: 'Premium acrylic base with metallic golden letters.', code: 'JZZ4501', icon: '🏷️' },
    { name: 'Basuri Vadak Name Plate', category: 'Name Plates', size: '8x15 Inch', price: '₹1,000', desc: 'Beautiful flute theme wooden-finish acrylic plate.', code: 'GZZ4801', icon: '🏷️' },
    { name: 'Glowing LED Name Plate', category: 'Name Plates', size: '6x12 Inch', price: '₹1,000', desc: 'Warm backlit LED plate with custom engravings.', code: 'GZZ4801', icon: '💡' },
    { name: 'MDF Family Name Plate', category: 'Name Plates', size: '6x12 Inch', price: '₹400', desc: 'Elegant laser-cut MDF wooden name board.', code: 'BEZ4501', icon: '🪵' },
    
    // LED & Photo Frames
    { name: 'LED Mirror Photo Frame', category: 'LED & Photo Frames', size: '12x18 Inch', price: '₹999', desc: 'Magic mirror with LED lights showing custom photo.', code: 'FZZ-2', icon: '🪞' },
    { name: 'Acrylic Couple Standee Frame', category: 'LED & Photo Frames', size: '12x18 Inch', price: '₹900', desc: 'High gloss acrylic cutout frame with photo prints.', code: 'BZZ-12', icon: '🖼️' },
    { name: 'Lamination Collage Frame', category: 'LED & Photo Frames', size: '8x12 Inch', price: '₹250', desc: 'Wooden collage lamination with multiple photos.', code: 'AZZ-1', icon: '🖼️' },
    { name: 'Canvas Frame Set', category: 'LED & Photo Frames', size: '8x12 Inch', price: '₹350', desc: 'Decorative canvas painting print setup.', code: 'BZZ-1', icon: '🖼️' },

    // Sketches & Paintings
    { name: 'Handmade Pencil Sketch (Single)', category: 'Sketches & Paintings', size: '8x12 Inch', price: '₹500', desc: 'Realistic pencil drawing by our skilled artists.', code: 'SK-01', icon: '✏️' },
    { name: 'Pencil Sketch (Couple)', category: 'Sketches & Paintings', size: '12x18 Inch', price: '₹1,500', desc: 'Beautiful couple portrait handmade sketch.', code: 'SK-02', icon: '✏️' },
    { name: 'Canvas Oil Painting', category: 'Sketches & Paintings', size: '12x18 Inch', price: '₹5,000', desc: 'Original acrylic/oil custom canvas painting.', code: 'SK-03', icon: '🎨' },

    // Metal Rakhis
    { name: 'Engraved Metal Name Rakhi', category: 'Metal Rakhis', size: 'Standard', price: '₹130', desc: 'Premium metal rakhi personalized with name.', code: 'RK-01', icon: '📿' },
    { name: 'Custom Photo Rakhi', category: 'Metal Rakhis', size: 'Standard', price: '₹120', desc: 'Photo printed rakhi with colorful threads.', code: 'RK-02', icon: '📿' },

    // Mugs & Gifting
    { name: 'Custom Printed Mug', category: 'Mugs & Gifting', size: 'Standard 330ml', price: '₹250', desc: 'Glossy ceramic photo mug with custom layout.', code: 'MG-01', icon: '☕' },
    { name: 'Personalized Photo Cushion', category: 'Mugs & Gifting', size: '12x12 Inch', price: '₹350', desc: 'Fluffy printed cushion for home and gifting.', code: 'CS-01', icon: '🛋️' }
  ];

  filteredProducts = this.products;

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.filterByCategory('All');
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'All') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
    // Re-run scroll animations after DOM updates
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

  getWhatsAppLink(productName: string, productCode: string) {
    const message = `Hi! I'm interested in ordering the ${productName} (Code: ${productCode}). Please share details.`;
    return `https://wa.me/919300545485?text=${encodeURIComponent(message)}`;
  }
}
