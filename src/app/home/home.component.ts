import { Component, OnInit, OnDestroy, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
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
}
