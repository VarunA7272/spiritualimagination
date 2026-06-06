import { Component, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements AfterViewInit {
  reviews = [
    { stars: '⭐⭐⭐⭐⭐', text: 'Amazing quality mugs! Got them for my office team and everyone loved it. The printing was crystal clear and the delivery was super fast. Will definitely order again!', author: 'Rahul S.' },
    { stars: '⭐⭐⭐⭐⭐', text: 'Best custom gifts in Jabalpur! Fast delivery and beautiful packaging. Ordered a personalized cushion for my sister\'s birthday and she absolutely loved it.', author: 'Priya M.' },
    { stars: '⭐⭐⭐⭐⭐', text: 'Ordered trophies for our school\'s annual event. Superb finish and very affordable. The team was very responsive on WhatsApp and delivered on time!', author: 'Ankit T.' }
  ];

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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
