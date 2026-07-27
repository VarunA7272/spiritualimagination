import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { GHS_SUPABASE_URL, GHS_SUPABASE_KEY } from '../configs/idcard-feature-flags';

export interface EmployeeRecord {
  id?: number;
  name: string;
  role: string;
  contact: string;
  dob: string;
  employee_id: string;
  address: string;
  office_contact: string;
  card_url: string;
  photo_url?: string;
  created_at: string;
}

export interface StudentRecord {
  id?: number;
  student_name: string;
  course: string;
  section?: string;
  phone?: string;
  fh_name: string;
  dob: string;
  address: string;
  session: string;
  id_no: string;
  card_url: string;
  photo_url?: string;
  created_at: string;
}

export interface IgsRecord {
  id?: number;
  student_name: string;
  course: string;
  section?: string;
  phone?: string;
  fh_name: string;
  dob: string;
  address: string;
  session: string;
  id_no: string;
  card_url: string;
  photo_url?: string;
  created_at: string;
}

export interface GhsPalasundarRecord {
  id?: number;
  student_name: string;
  course: string;
  section?: string;
  phone?: string;
  fh_name: string;
  dob: string;
  address: string;
  session: string;
  id_no: string;
  card_url: string;
  photo_url?: string;
  created_at: string;
}

export interface MpsRecord {
  id?: number;
  student_name: string;
  course?: string;
  section?: string;
  phone?: string;
  fh_name: string;
  dob?: string;
  address: string;
  session?: string;
  id_no?: string;
  card_url: string;
  photo_url?: string;
  created_at: string;
}

export interface DeleteLog {
  id?: number;
  deleted_at: string;
  admin_email: string;
  card_name: string;
  card_type: string;
  card_details?: any;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabaseUrl = 'https://fxhkvhsagcxylddtrnur.supabase.co';
  private supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4aGt2aHNhZ2N4eWxkZHRybnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODU0NjgsImV4cCI6MjA5NTM2MTQ2OH0.aNtXqrV573A7lXVJn0wAGxs6sIJby-LItZDqrhXmik8';
  private supabase: SupabaseClient;
  private supabaseGhs: SupabaseClient | null = null;

  public user = signal<User | null>(null);
  public session = signal<Session | null>(null);
  public ghsUser = signal<User | null>(null);
  public ghsSession = signal<Session | null>(null);

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

    // Get initial session for default client
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });

    // Listen for auth changes on default client
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      this.user.set(session?.user ?? null);
    });

    // Listen for GHS Palasundar client auth changes
    if (GHS_SUPABASE_URL && GHS_SUPABASE_KEY && GHS_SUPABASE_KEY !== 'YOUR_GHS_SUPABASE_KEY') {
      try {
        this.supabaseGhs = createClient(GHS_SUPABASE_URL, GHS_SUPABASE_KEY);

        this.supabaseGhs.auth.getSession().then(({ data: { session } }) => {
          this.ghsSession.set(session);
          this.ghsUser.set(session?.user ?? null);
        });

        this.supabaseGhs.auth.onAuthStateChange((_event, session) => {
          this.ghsSession.set(session);
          this.ghsUser.set(session?.user ?? null);
        });
      } catch (err) {
        console.error('Failed to initialize GHS Palasundar Supabase client:', err);
      }
    }
  }

  private getClient(isGhs?: boolean): SupabaseClient {
    if (isGhs && this.supabaseGhs) {
      return this.supabaseGhs;
    }
    return this.supabase;
  }

  // --- Auth API ---

  async signUp(email: string, password: string, isGhs = false) {
    const client = this.getClient(isGhs);
    const { data, error } = await client.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw new Error(this.formatAuthError(error, 'Registration failed.'));
    }
    return data;
  }

  async signIn(email: string, password: string, isGhs = false) {
    const client = this.getClient(isGhs);
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(this.formatAuthError(error, 'Invalid email or password. Please try again.'));
    }
    return data;
  }

  async signOut(isGhs = false) {
    const client = this.getClient(isGhs);
    const { error } = await client.auth.signOut();
    if (error) throw error;
    if (isGhs) {
      this.ghsSession.set(null);
      this.ghsUser.set(null);
    } else {
      this.session.set(null);
      this.user.set(null);
    }
  }

  isAuthenticated(isGhs = false): boolean {
    if (isGhs) {
      return this.ghsSession() !== null;
    }
    return this.session() !== null;
  }

  private formatAuthError(error: any, fallback: string): string {
    const message = error?.message || '';

    if (/invalid login credentials|invalid email or password/i.test(message)) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }

    if (/email not confirmed|confirm your email/i.test(message)) {
      return 'Please confirm your email address before signing in.';
    }

    return message || fallback;
  }

  // --- Storage & Database API ---

  async uploadPhoto(file: File, fileName: string, bucket = 'employee-cards'): Promise<string> {
    const isSecondary =
      bucket === 'ghs-palasundar-cards' || bucket === 'mps-cards' || bucket === 'igs-cards';
    const client = this.getClient(isSecondary);
    const { error } = await client.storage.from(bucket).upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data } = client.storage.from(bucket).getPublicUrl(fileName);

    return data.publicUrl;
  }

  async uploadCard(blob: Blob, fileName: string, bucket = 'employee-cards'): Promise<string> {
    const isSecondary =
      bucket === 'ghs-palasundar-cards' || bucket === 'mps-cards' || bucket === 'igs-cards';
    const client = this.getClient(isSecondary);
    const { error } = await client.storage.from(bucket).upload(fileName, blob, {
      contentType: 'image/png',
    });

    if (error) {
      throw error;
    }

    const { data } = client.storage.from(bucket).getPublicUrl(fileName);

    return data.publicUrl;
  }

  // --- Generic Database CRUD Operations ---

  async saveRecord(tableName: string, record: any, isSecondary = false): Promise<any> {
    const client = this.getClient(isSecondary);
    const { data, error } = await client.from(tableName).insert([record]).select();

    if (error) throw error;
    return data;
  }

  async getAllRecords(tableName: string, isSecondary = false): Promise<any[]> {
    const client = this.getClient(isSecondary);
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateRecord(
    tableName: string,
    id: number,
    record: any,
    isSecondary = false,
  ): Promise<any> {
    const client = this.getClient(isSecondary);
    const { data, error } = await client.from(tableName).update(record).eq('id', id).select();

    if (error) throw error;
    return data;
  }

  async deleteRecord(
    tableName: string,
    id: number | string,
    isSecondary = false,
    cardType = 'student',
  ): Promise<any> {
    const client = this.getClient(isSecondary);
    let cardName = 'Unknown';
    let cardDetails: any = null;

    try {
      const { data: record } = await client.from(tableName).select('*').eq('id', id).single();

      if (record) {
        cardName = record.student_name || record.name || 'Unknown';
        cardDetails = record;
        const filesToDelete: string[] = [];
        if (record.card_url) {
          const file = this.extractFilenameFromUrl(record.card_url);
          if (file) filesToDelete.push(file);
        }
        if (record.photo_url) {
          const file = this.extractFilenameFromUrl(record.photo_url);
          if (file) filesToDelete.push(file);
        }

        if (filesToDelete.length > 0) {
          const { error: deleteError } = await client.storage.from(tableName).remove(filesToDelete);

          if (deleteError) {
            console.error('Failed to delete files from ' + tableName + ' storage bucket:', deleteError);
            throw new Error('Storage cleanup failed: ' + deleteError.message);
          }
        }
      }
    } catch (e) {
      console.warn('Could not clean up storage files before delete for ' + tableName + ':', e);
    }

    const { data, error } = await client.from(tableName).delete().eq('id', id);

    if (error) throw error;

    try {
      const adminEmail = this.user()?.email || 'unknown@admin.com';
      await this.saveDeleteLog({
        admin_email: adminEmail,
        card_name: cardName,
        card_type: cardType,
        card_details: cardDetails,
      });
    } catch (logErr) {
      console.warn('Could not save delete log to database:', logErr);
    }

    return data;
  }

  async getStudentNames(
    tableName = 'employee-cards',
    isSecondary = false,
    nameField = 'student_name',
    fhField = 'fh_name',
  ): Promise<{ student_name: string; fh_name: string }[]> {
    try {
      const client = this.getClient(isSecondary);
      const { data, error } = await client
        .from(tableName)
        .select(nameField + ', ' + fhField)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!error && data) {
        return data.map((item: any) => ({
          student_name: item[nameField] || '',
          fh_name: item[fhField] || '',
        }));
      }
    } catch (e) {
      console.warn(
        'Database fetch for ' + tableName + ' names failed, falling back to Storage list:',
        e,
      );
    }

    try {
      const client = this.getClient(isSecondary);
      const { data, error } = await client.storage.from(tableName).list('', {
        limit: 500,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) throw error;

      const list = data || [];
      return list
        .map((file) => {
          const name = file.name;
          const isCard =
            name.endsWith('-card.png') || name.endsWith('-card.jpg') || name.endsWith('-card.jpeg');
          if (!isCard) return null;

          let suffixLen = 9; // '-card.png' or '-card.jpg'
          if (name.endsWith('.jpeg')) suffixLen = 10;
          let base = name.slice(0, -suffixLen);
          const firstDash = base.indexOf('-');
          if (firstDash !== -1) {
            base = base.slice(firstDash + 1);
          }

          const parts = base.split('_');
          const stdName = parts[0] ? parts[0].trim().replace(/_/g, ' ') : '';
          const fhName = parts[1] ? parts[1].trim().replace(/_/g, ' ') : '';

          return {
            student_name: stdName,
            fh_name: fhName,
          };
        })
        .filter(
          (item): item is { student_name: string; fh_name: string } =>
            item !== null && item.student_name.length > 0,
        );
    } catch (err) {
      console.error('Failed to list storage items for ' + tableName + ':', err);
      return [];
    }
  }

  // --- Backwards Compatibility Thin Wrappers ---

  async getEmployeeNames() {
    return this.getStudentNames('nursing-collg', false, 'name', 'role').then((list) =>
      list.map((d) => ({ name: d.student_name, role: d.fh_name })),
    );
  }
  async getGhsPalasundarStudentNames() {
    return this.getStudentNames('ghs-palasundar-cards', true);
  }
  async getIgsStudentNames() {
    return this.getStudentNames('igs-cards', true);
  }
  async getMpsStudentNames() {
    return this.getStudentNames('mps-cards', true);
  }

  async saveEmployeeRecord(record: EmployeeRecord) {
    return this.saveRecord('nursing-collg', record, false);
  }
  async getAllEmployeeRecords() {
    return this.getAllRecords('nursing-collg', false);
  }
  async updateEmployeeRecord(id: number, record: Partial<EmployeeRecord>) {
    return this.updateRecord('nursing-collg', id, record, false);
  }
  async deleteEmployeeRecord(id: number) {
    return this.deleteRecord('nursing-collg', id, false, 'employee');
  }

  async saveStudentRecord(record: StudentRecord) {
    return this.saveRecord('employee-cards', record, false);
  }
  async getAllStudentRecords() {
    return this.getAllRecords('employee-cards', false);
  }
  async updateStudentRecord(id: number, record: Partial<StudentRecord>) {
    return this.updateRecord('employee-cards', id, record, false);
  }
  async deleteStudentRecord(id: number) {
    return this.deleteRecord('employee-cards', id, false, 'student');
  }

  async saveGhsPalasundarRecord(record: GhsPalasundarRecord) {
    return this.saveRecord('ghs-palasundar-cards', record, true);
  }
  async getAllGhsPalasundarRecords() {
    return this.getAllRecords('ghs-palasundar-cards', true);
  }
  async updateGhsPalasundarRecord(id: number, record: Partial<GhsPalasundarRecord>) {
    return this.updateRecord('ghs-palasundar-cards', id, record, true);
  }
  async deleteGhsPalasundarRecord(id: number) {
    return this.deleteRecord('ghs-palasundar-cards', id, true, 'ghs-palasundar');
  }

  async saveIgsRecord(record: IgsRecord) {
    return this.saveRecord('igs-cards', record, true);
  }
  async getAllIgsRecords() {
    return this.getAllRecords('igs-cards', true);
  }
  async updateIgsRecord(id: number, record: Partial<IgsRecord>) {
    return this.updateRecord('igs-cards', id, record, true);
  }
  async deleteIgsRecord(id: number) {
    return this.deleteRecord('igs-cards', id, true, 'igs-card');
  }

  async saveMpsRecord(record: MpsRecord) {
    return this.saveRecord('mps-cards', record, true);
  }
  async getAllMpsRecords() {
    return this.getAllRecords('mps-cards', true);
  }
  async updateMpsRecord(id: number, record: Partial<MpsRecord>) {
    return this.updateRecord('mps-cards', id, record, true);
  }
  async deleteMpsRecord(id: number) {
    return this.deleteRecord('mps-cards', id, true, 'mps-card');
  }

  private extractFilenameFromUrl(url: string): string {
    try {
      const decoded = decodeURIComponent(url);
      const parts = decoded.split('/');
      return parts[parts.length - 1] || '';
    } catch (e) {
      console.error('Failed to parse filename from URL:', url, e);
      return '';
    }
  }

  // --- Delete Auditing API Operations ---

  async saveDeleteLog(log: Omit<DeleteLog, 'id' | 'deleted_at'>): Promise<any> {
    const { data, error } = await this.supabase
      .from('delete_logs')
      .insert([
        {
          ...log,
          deleted_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return data;
  }

  async getDeleteLogs(): Promise<DeleteLog[]> {
    const { data, error } = await this.supabase
      .from('delete_logs')
      .select('*')
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async syncStorageToDb(
    type: 'employee' | 'student' | 'ghs-palasundar' | 'mps-card' | 'igs-card',
  ): Promise<{ inserted: number; skipped: number }> {
    let inserted = 0;
    let skipped = 0;

    const configMap = {
      'employee': { bucket: 'nursing-collg', table: 'employee-records', isSecondary: false, isEmployee: true },
      'student': { bucket: 'employee-cards', table: 'student-records', isSecondary: false, isEmployee: false },
      'ghs-palasundar': { bucket: 'ghs-palasundar-cards', table: 'ghs-palasundar-records', isSecondary: true, isEmployee: false },
      'mps-card': { bucket: 'mps-cards', table: 'mps-cards', isSecondary: true, isEmployee: false },
      'igs-card': { bucket: 'igs-cards', table: 'igs-cards', isSecondary: true, isEmployee: false },
    };

    const target = configMap[type];
    if (!target) {
      throw new Error('Unknown card type for sync: ' + type);
    }

    const client = this.getClient(target.isSecondary);
    const dbRecords = await this.getAllRecords(target.table, target.isSecondary);
    const existingUrls = new Set(dbRecords.map((r) => r.card_url));

    const { data: files, error } = await client.storage
      .from(target.bucket)
      .list('', { limit: 1000 });

    if (error) throw error;

    for (const file of files || []) {
      const isCard =
        file.name.endsWith('-card.png') ||
        file.name.endsWith('-card.jpg') ||
        file.name.endsWith('-card.jpeg');
      if (!isCard) continue;

      const { data: urlData } = client.storage
        .from(target.bucket)
        .getPublicUrl(file.name);
      const cardUrl = urlData.publicUrl;

      if (existingUrls.has(cardUrl)) {
        skipped++;
        continue;
      }

      let suffixLen = 9;
      if (file.name.endsWith('.jpeg')) suffixLen = 10;
      let base = file.name.slice(0, -suffixLen);
      const firstDash = base.indexOf('-');
      if (firstDash !== -1) {
        base = base.slice(firstDash + 1);
      }
      const parts = base.split('_');
      const nameVal = parts[0] ? parts[0].trim() : 'UNKNOWN';
      const fhVal = parts[1] ? parts[1].trim() : '—';

      // Find photo
      let photoUrl = '';
      const timestamp = file.name.split('-')[0];
      const safeName = nameVal.replace(/_/g, ' ');
      const photoFileName = timestamp + '-' + safeName + '-photo.png';
      const { data: photoList } = await client.storage
        .from(target.bucket)
        .list('', { search: photoFileName });

      if (photoList && photoList.length > 0) {
        const { data: pUrlData } = client.storage
          .from(target.bucket)
          .getPublicUrl(photoFileName);
        photoUrl = pUrlData.publicUrl;
      }

      const dbRecord = {
        card_url: cardUrl,
        photo_url: photoUrl || null,
        created_at: file.created_at || new Date().toISOString()
      };

      if (target.isEmployee) {
        Object.assign(dbRecord, {
          name: nameVal,
          role: fhVal,
          contact: 'N/A',
          dob: '1990-01-01',
          employee_id: 'N/A',
          address: 'N/A',
          office_contact: 'N/A'
        });
      } else {
        Object.assign(dbRecord, {
          student_name: nameVal,
          fh_name: fhVal,
          course: 'N/A',
          section: 'N/A',
          dob: '1990-01-01',
          address: 'N/A',
          session: '2026-2027',
          id_no: 'N/A',
          phone: 'N/A'
        });
      }

      await this.saveRecord(target.table, dbRecord, target.isSecondary);
      inserted++;
    }

    return { inserted, skipped };
  }
}
