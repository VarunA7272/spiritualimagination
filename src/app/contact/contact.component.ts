import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit, AfterViewInit {
  constructor(
    private seoService: SeoService,
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.seoService.generateTags({
      title: 'Contact Us & Jabalpur Store Location',
      description: 'Visit Spiritual Imagination in Jabalpur, Madhya Pradesh. Find our exact store location coordinates, contact numbers, business hours, and direct WhatsApp links.',
      keywords: 'contact spiritual imagination, jabalpur custom gifts shop, maps coordinates jabalpur',
      schema: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Spiritual Imagination",
        "image": "https://sidesigns.netlify.app/favicon.ico",
        "telephone": "+919300545485",
        "email": "varunrajore7272@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "805, Wright Town",
          "addressLocality": "Jabalpur",
          "addressRegion": "Madhya Pradesh",
          "postalCode": "482002",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 23.165216123419018,
          "longitude": 79.91560607675933
        },
        "url": "https://sidesigns.netlify.app/contact",
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "10:30",
          "closes": "21:00"
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
