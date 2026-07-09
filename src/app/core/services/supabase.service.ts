import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Category {
  name: string;
  subcategories: string[];
}

export interface Product {
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
  featured?: boolean;
}

export interface Order {
  id?: string;
  customer_id?: string;
  customer_name?: string;
  customer_mobile?: string;
  items: any[];
  total_amount: string;
  status: string;
  created_at?: string;
}

export interface Review {
  stars: string;
  ratingValue?: number;
  text: string;
  author: string;
  photos?: string[];
  date?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseUrl = 'https://yuytnexcomuscsbmtugv.supabase.co';
  private supabaseKey = 'sb_publishable_sqYrrAblQGwDMw32kaUqyg_x887dtYl';
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.checkAndSeedDatabase();
  }

  // --- CATEGORIES API ---
  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('name, subcategories')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async upsertCategory(category: Category): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .upsert(
        { name: category.name, subcategories: category.subcategories },
        { onConflict: 'name' }
      );

    if (error) throw error;
  }

  async deleteCategory(name: string): Promise<void> {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('name', name);

    if (error) throw error;
  }

  // --- PRODUCTS API ---
  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async saveProduct(product: Product): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .upsert({
        code: product.code.toUpperCase(),
        name: product.name,
        category: product.category,
        subcategory: product.subcategory || null,
        size: product.size,
        price: product.price,
        desc: product.desc || null,
        icon: product.icon || '🏷️',
        images: product.images || (product.image ? [product.image] : []),
        featured: product.featured || false
      }, { onConflict: 'code' });

    if (error) throw error;
  }

  async deleteProduct(code: string): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('code', code);

    if (error) throw error;
  }

  // --- REVIEWS API ---
  async getReviews(): Promise<Review[]> {
    const { data, error } = await this.supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map database fields to UI Review fields
    return (data || []).map(r => ({
      stars: r.stars,
      ratingValue: r.rating_value,
      text: r.text,
      author: r.author,
      photos: r.photos || [],
      date: this.formatRelativeDate(r.created_at)
    }));
  }

  async insertReview(review: Review): Promise<void> {
    const { error } = await this.supabase
      .from('reviews')
      .insert({
        author: review.author,
        stars: review.stars,
        rating_value: review.ratingValue,
        text: review.text,
        photos: review.photos || []
      });

    if (error) throw error;
  }

  // --- AUTO-SEEDER LOGIC ---
  private async checkAndSeedDatabase() {
    try {
      // 1. Seed Categories if empty
      const { count: catCount, error: catError } = await this.supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (catError) {
        console.warn('Seeding check failed: categories table might not exist yet.', catError.message);
        return; // Prevents crashing if tables aren't created yet
      }

      const defaultCats = [
        { name: 'Name Plates', subcategories: ['Acrylic', 'LED Backlit', 'Wooden', 'MDF Board'] },
        { name: 'LED & Photo Frames', subcategories: ['Magic Mirrors', 'Couple Standees', 'Collage Frames', 'Canvas Frames'] },
        { name: 'Sketches & Paintings', subcategories: ['Pencil Sketches', 'Oil Paintings', 'Acrylic Canvas'] },
        { name: 'Metal Rakhis', subcategories: ['Name Rakhis', 'Photo Rakhis'] },
        { name: 'Mugs & Gifting', subcategories: ['Custom Mugs', 'Photo Cushions'] }
      ];

      if (catCount === 0 && defaultCats.length > 0) {
        console.log('Seeding default categories...');
        const { error: insError } = await this.supabase.from('categories').insert(defaultCats);
        if (insError) console.error('Error seeding categories', insError);
      }

      // 2. Seed Products if empty
      const { count: prodCount } = await this.supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const defaultProducts: any[] = []; // User emptied the default products list

      if (prodCount === 0 && defaultProducts.length > 0) {
        console.log('Seeding default products...');
        const { error: insError } = await this.supabase.from('products').insert(defaultProducts);
        if (insError) console.error('Error seeding products', insError);
      }

      // 3. Seed Reviews if empty
      const { count: revCount } = await this.supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      const defaultReviews = [
        { stars: '⭐⭐⭐⭐⭐', rating_value: 5, text: 'Amazing quality mugs! Got them for my office team and everyone loved it. The printing was crystal clear and the delivery was super fast. Will definitely order again!', author: 'Rahul S.' },
        { stars: '⭐⭐⭐⭐⭐', rating_value: 5, text: 'Best custom gifts in Jabalpur! Fast delivery and beautiful packaging. Ordered a personalized cushion for my sister\'s birthday and she absolutely loved it.', author: 'Priya M.' },
        { stars: '⭐⭐⭐⭐⭐', rating_value: 5, text: 'Ordered trophies for our school\'s annual event. Superb finish and very affordable. The team was very responsive on WhatsApp and delivered on time!', author: 'Ankit T.' }
      ];

      if (revCount === 0 && defaultReviews.length > 0) {
        console.log('Seeding default reviews...');
        const { error: insError } = await this.supabase.from('reviews').insert(defaultReviews);
        if (insError) console.error('Error seeding reviews', insError);
      }
    } catch (err) {
      console.warn('Seeding failed: check connection or schema setup in Supabase.', err);
    }
  }

  // Helper: Format ISO timestamp to relative string (e.g. "Just now", "2 days ago")
  private formatRelativeDate(isoDateStr: string): string {
    try {
      const date = new Date(isoDateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 5) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths === 1) return '1 month ago';
      return `${diffMonths} months ago`;
    } catch (e) {
      return 'Recent';
    }
  }

  // --- FEATURED PRODUCTS ---
  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async toggleProductFeatured(code: string, featured: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('products')
      .update({ featured })
      .eq('code', code.toUpperCase());

    if (error) throw error;
  }

  // --- OTP VERIFICATION RPCs ---
  async requestOtpRpc(mobile: string): Promise<string> {
    const { data, error } = await this.supabase
      .rpc('request_otp', { mobile_num: mobile });

    if (error) throw error;
    return data;
  }

  async verifyOtpRpc(mobile: string, code: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('verify_otp', { mobile_num: mobile, input_code: code });

    if (error) throw error;
    return !!data;
  }

  // --- CUSTOMER & ORDER PLACEMENT ---
  async createCustomerAndOrder(customer: { name: string; mobile: string }, items: any[], totalAmount: string): Promise<void> {
    // 1. Upsert customer
    const { data: customerData, error: customerError } = await this.supabase
      .from('customers')
      .upsert({ full_name: customer.name, mobile: customer.mobile }, { onConflict: 'mobile' })
      .select()
      .single();

    if (customerError) throw customerError;

    // 2. Insert order
    const { error: orderError } = await this.supabase
      .from('orders')
      .insert({
        customer_id: customerData.id,
        items,
        total_amount: totalAmount,
        status: 'new'
      });

    if (orderError) throw orderError;
  }

  // --- ADMIN ORDER MANAGEMENT ---
  async getOrders(): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        id,
        items,
        total_amount,
        status,
        created_at,
        customer_id,
        customers (
          full_name,
          mobile
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((o: any) => ({
      id: o.id,
      items: o.items,
      total_amount: o.total_amount,
      status: o.status,
      created_at: o.created_at,
      customer_name: o.customers?.full_name || 'Unknown Customer',
      customer_mobile: o.customers?.mobile || 'No Mobile'
    }));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  }
}
