import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  robots?: string;
  url?: string;
  image?: string;
  type?: string;
  schema?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private defaultTitle = 'Spiritual Imagination 🎁 — Custom Gifts Jabalpur';
  private defaultDesc = 'Premium personalized gifts, custom name plates, magic mirrors, handmade sketches, metal rakhis, and corporate trophies in Jabalpur, Madhya Pradesh.';
  private defaultImage = 'https://sidesigns.netlify.app/assets/logo.png'; // Fallback social share logo

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  generateTags(config: SeoConfig) {
    const title = config.title ? `${config.title} | Spiritual Imagination` : this.defaultTitle;
    const description = config.description || this.defaultDesc;
    const image = config.image || this.defaultImage;
    const url = config.url || (typeof window !== 'undefined' ? window.location.href : 'https://sidesigns.netlify.app');
    const robots = config.robots || 'index, follow';
    const type = config.type || 'website';

    // 1. Core Meta Tags
    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'robots', content: robots });
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    } else {
      this.metaService.updateTag({ name: 'keywords', content: 'custom gifts jabalpur, personalized trophies, led backlit name plates, acrylic name plate jabalpur, sketches, metal rakhis, corporate gifting jabalpur' });
    }

    // 2. Open Graph (Facebook / LinkedIn / WhatsApp)
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Spiritual Imagination' });
    this.metaService.updateTag({ property: 'og:locale', content: 'en_IN' });

    // 3. Twitter Cards
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });
    this.metaService.updateTag({ name: 'twitter:url', content: url });

    // 4. Update Canonical Link
    this.updateCanonicalUrl(url);

    // 5. Inject JSON-LD Schema.org Structured Data
    if (config.schema) {
      this.setJsonLdSchema(config.schema);
    } else {
      this.removeJsonLdSchema();
    }
  }

  private updateCanonicalUrl(url: string) {
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }

  private setJsonLdSchema(schema: any) {
    // Find or create schema script tag
    let script: HTMLScriptElement | null = this.document.getElementById('seo-jsonld-schema') as HTMLScriptElement;
    if (script) {
      script.text = JSON.stringify(schema);
    } else {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'seo-jsonld-schema');
      script.text = JSON.stringify(schema);
      this.document.head.appendChild(script);
    }
  }

  private removeJsonLdSchema() {
    const script = this.document.getElementById('seo-jsonld-schema');
    if (script) {
      script.remove();
    }
  }
}
