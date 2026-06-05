import { Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseUrl = 'https://fxhkvhsagcxylddtrnur.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aGt2aHNhZ2N4eWxkZHRybnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODU0NjgsImV4cCI6MjA5NTM2MTQ2OH0.aNtXqrV573A7lXVJn0wAGxs6sIJby-LItZDqrhXmik8';
  private supabase: SupabaseClient;

  private sessionSubject = new BehaviorSubject<Session | null>(null);
  public session$: Observable<Session | null> = this.sessionSubject.asObservable();

  constructor(private router: Router, private ngZone: NgZone) {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

    // Get initial session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.ngZone.run(() => {
        this.sessionSubject.next(session);
      });
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.ngZone.run(() => {
        this.sessionSubject.next(session);
        if (!session) {
          this.router.navigate(['/login']);
        }
      });
    });
  }

  get currentSession(): Session | null {
    return this.sessionSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentSession?.user;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      throw error;
    }
    return data;
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw error;
    }
    this.ngZone.run(() => {
      this.router.navigate(['/login']);
    });
  }
}
