import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, AfterViewInit {
  constructor(
    private seoService: SeoService,
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.seoService.generateTags({
      title: 'About Our Artistry & Custom Gifts Maker',
      description: 'Learn about Spiritual Imagination in Jabalpur. We specialize in custom-designed name plates, personalized photo standees, magic mirrors, handmade sketches, metal rakhis, and trophies.',
      keywords: 'about custom gifts jabalpur, personalized trophies maker, wooden design craft',
      schema: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About Spiritual Imagination",
        "description": "Information about our custom gift crafting services, name plates, and trophies design in Jabalpur.",
        "url": "https://sidesigns.netlify.app/about",
        "mainEntity": {
          "@type": "Organization",
          "name": "Spiritual Imagination",
          "url": "https://sidesigns.netlify.app"
        }
      }
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
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
}
