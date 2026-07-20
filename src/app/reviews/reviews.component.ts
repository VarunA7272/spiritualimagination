import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Review } from '../core/services/supabase.service';
import { SeoService } from '../core/services/seo.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit, AfterViewInit {
  reviews: Review[] = [];

  // Write Review Modal State
  writeReviewModalOpen = false;
  reviewRating = 0;
  reviewHoverRating = 0;
  reviewText = '';
  reviewAuthor = '';
  uploadedPhotos: string[] = [];

  // Success Toast State
  successToastMessage = '';

  constructor(
    private supabaseService: SupabaseService,
    private seoService: SeoService,
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.seoService.generateTags({
      title: 'Customer Reviews & Testimonials',
      description: 'Read reviews from real customers who ordered customized name plates, magic backlit LED photo frames, trophies, metal rakhis, and custom mugs in Jabalpur.',
      keywords: 'customer reviews jabalpur, gift store ratings, custom frames testimonials',
      schema: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Custom Gift Creations & Personalization Services",
        "image": "https://sidesigns.netlify.app/favicon.ico",
        "description": "Customized gift crafting services: LED backlit name plates, trophies, pencil sketches, and photo gifts.",
        "brand": {
          "@type": "Brand",
          "name": "Spiritual Imagination"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "22",
          "bestRating": "5",
          "worstRating": "1"
        }
      }
    });

    this.loadReviews();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  loadReviews() {
    this.supabaseService.getReviews().then(data => {
      this.reviews = data;
      // Re-run animations to observe newly rendered reviews
      setTimeout(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.initScrollAnimations();
        }
      }, 100);
    }).catch(err => {
      console.error('Error loading reviews from Supabase', err);
    });
  }

  openWriteReviewModal() {
    this.writeReviewModalOpen = true;
    this.reviewRating = 0;
    this.reviewHoverRating = 0;
    this.reviewText = '';
    this.reviewAuthor = '';
    this.uploadedPhotos = [];
  }

  closeWriteReviewModal(event?: Event) {
    if (event) event.stopPropagation();
    this.writeReviewModalOpen = false;
  }

  setRating(rating: number) {
    this.reviewRating = rating;
  }

  setHoverRating(rating: number) {
    this.reviewHoverRating = rating;
  }

  clearHoverRating() {
    this.reviewHoverRating = 0;
  }

  async onPhotoSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedDataUrl = await this.compressImage(file);
        this.uploadedPhotos.push(compressedDataUrl);
      } catch (err) {
        console.error('Error compressing file', file.name, err);
      }
    }
    event.target.value = '';
  }

  compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            reject(new Error('Canvas context could not be created'));
          }
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  removeUploadedPhoto(idx: number) {
    this.uploadedPhotos.splice(idx, 1);
  }

  submitReview() {
    if (this.reviewRating === 0) return;

    if (!isPlatformBrowser(this.platformId)) return;

    const starString = '⭐'.repeat(this.reviewRating);
    const authorName = this.reviewAuthor.trim() || 'Spiritual Imagination Customer';

    const newReview: Review = {
      stars: starString,
      ratingValue: this.reviewRating,
      text: this.reviewText.trim(),
      author: authorName,
      photos: this.uploadedPhotos
    };

    // Insert into Supabase
    this.supabaseService.insertReview(newReview).then(() => {
      // Reload reviews from DB
      this.loadReviews();

      // Close Modal
      this.writeReviewModalOpen = false;

      // Trigger open maps writing review panel
      const mapsReviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJ1btuZxeuHTkRo6xrM5FXVxs';
      window.open(mapsReviewUrl, '_blank');

      // Show Toast
      this.successToastMessage = '✓ Thank you! Opening Google Reviews in a new window to publish publicly.';
      setTimeout(() => {
        this.successToastMessage = '';
      }, 6000);
    }).catch(err => {
      alert('Error submitting review to database: ' + err.message);
    });
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
