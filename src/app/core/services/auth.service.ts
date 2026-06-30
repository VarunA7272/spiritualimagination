import { Injectable, NgZone } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseUrl = 'https://yuytnexcomuscsbmtugv.supabase.co';
  private supabaseKey = 'sb_publishable_sqYrrAblQGwDMw32kaUqyg_x887dtYl';
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
