import { Component, ElementRef, ViewChild, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  FormsModule
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../core/services/idcard-supabase.service';
import html2canvas from 'html2canvas';
import {
  ENABLE_LOGIN_PAGE,
  ENABLE_DB_UPLOAD_CARD1,
  ENABLE_DB_UPLOAD_CARD2,
  ENABLE_DB_UPLOAD_CARD3,
  ENABLE_LOCAL_DOWNLOAD_CARD1,
  ENABLE_LOCAL_DOWNLOAD_CARD2,
  ENABLE_LOCAL_DOWNLOAD_CARD3
} from '../../core/configs/idcard-feature-flags';
import { LoaderService } from '../../core/services/idcard-loading.service';
import { LEGACY_SUBMISSIONS } from '../../core/configs/idcard-legacy-submissions';
import { CARD_CONFIGS, CardConfig, FormFieldConfig } from '../../core/configs/idcard-configs';

@Component({
  selector: 'app-dynamic-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './dynamic-generator.html',
  styleUrl: './dynamic-generator.css',
})
export class DynamicGeneratorComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private loader = inject(LoaderService);

  ENABLE_LOGIN_PAGE = ENABLE_LOGIN_PAGE;
  config!: CardConfig;
  studentForm!: FormGroup;

  // File references
  @ViewChild('photoFile') photoFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('layoutFile') layoutFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cardElement') cardElement!: ElementRef<HTMLDivElement>;

  // Form states
  photoDataURL: string | null = null;
  photoFile: File | null = null;
  layoutDataURL: string | null = null;
  layoutFile: File | null = null;
  isDragOver = false;
  isGenerating = false;
  toastMessage: string | null = null;

  submissions: any[] = [];
  searchQuery = '';
  today = new Date().toISOString().slice(0, 10);

  get isLoggedIn(): boolean {
    const isGhs = this.config.isSecondaryClient;
    return this.supabase.isAuthenticated(isGhs);
  }

  get enableLocalDownload(): boolean {
    const flag = this.config.enableLocalDownloadFlag;
    if (flag === 'ENABLE_LOCAL_DOWNLOAD_CARD1') return ENABLE_LOCAL_DOWNLOAD_CARD1;
    if (flag === 'ENABLE_LOCAL_DOWNLOAD_CARD2') return ENABLE_LOCAL_DOWNLOAD_CARD2;
    return ENABLE_LOCAL_DOWNLOAD_CARD3;
  }

  get enableDbUpload(): boolean {
    const flag = this.config.enableDbUploadFlag;
    if (flag === 'ENABLE_DB_UPLOAD_CARD1') return ENABLE_DB_UPLOAD_CARD1;
    if (flag === 'ENABLE_DB_UPLOAD_CARD2') return ENABLE_DB_UPLOAD_CARD2;
    return ENABLE_DB_UPLOAD_CARD3;
  }

  get canDownload(): boolean {
    return this.studentForm.valid && !!this.photoDataURL;
  }

  ngOnInit() {
    const mode = this.route.snapshot.data['mode'] || 'student-card';
    this.config = CARD_CONFIGS[mode] || CARD_CONFIGS['student-card'];
    this.initializeForm();
    this.loadSubmissions();
  }

  initializeForm() {
    const group: any = {};
    this.config.fields.forEach(field => {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.minLength) validators.push(Validators.minLength(field.minLength));
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
      if (field.pattern) validators.push(Validators.pattern(field.pattern));

      group[field.name] = new FormControl(field.defaultValue || '', validators);
    });
    this.studentForm = new FormGroup(group);
  }

  async loadSubmissions() {
    if (!this.enableDbUpload) {
      this.submissions = [];
      this.cdr.detectChanges();
      return;
    }
    try {
      const nameCol = this.config.id === 'generator' ? 'name' : 'student_name';
      const fhCol = this.config.id === 'generator' ? 'role' : 'fh_name';
      
      const data = await this.supabase.getStudentNames(
        this.config.dbTable, 
        this.config.isSecondaryClient, 
        nameCol, 
        fhCol
      );
      this.submissions = data;
      this.cdr.detectChanges();
    } catch (e) {
      console.warn('Failed to load submissions for current generator:', e);
      this.submissions = [];
      this.cdr.detectChanges();
    }
  }

  get filteredSubmissions() {
    if (!this.enableDbUpload) return [];
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return this.submissions.slice(0, 10);
    return this.submissions.filter(s =>
      (s.student_name || '').toLowerCase().includes(q) ||
      (s.fh_name || '').toLowerCase().includes(q)
    );
  }

  getValue(name: string): string {
    return this.studentForm.get(name)?.value || '';
  }

  getField(name: string): AbstractControl {
    return this.studentForm.get(name)!;
  }

  uppercaseField(name: string) {
    const field = this.config.fields.find(f => f.name === name);
    if (field?.uppercaseOnBlur) {
      const val = this.getValue(name);
      this.studentForm.get(name)?.setValue((val || '').toUpperCase(), { emitEvent: false });
    }
  }

  fmt(val: string, fallback = '—'): string {
    if (!val || !val.trim()) return fallback;
    return val.toUpperCase().trim();
  }

  fmtDob(dob: string): string {
    if (!dob) return '';
    const parts = dob.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY
    }
    return dob;
  }

  fmtAddress(addr: string): string {
    if (!addr) return '';
    const cleaned = addr.replace(/\s+/g, ' ').trim();
    if (cleaned.length > 38) {
      const breakIdx = cleaned.indexOf(' ', 30);
      if (breakIdx !== -1) {
        return cleaned.substring(0, breakIdx) + '\n' + cleaned.substring(breakIdx + 1);
      }
    }
    return cleaned;
  }

  getFieldErrorMessage(name: string): string {
    const control = this.studentForm.get(name);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['minlength']) return `Minimum length is ${control.errors['minlength'].requiredLength} characters.`;
    if (control.errors['pattern']) {
      if (name === 'contact' || name === 'phone') return 'Enter a valid 10-digit mobile number.';
      return 'Invalid format.';
    }
    return 'Invalid field value.';
  }

  // --- Upload handlers ---
  triggerFileInput() {
    this.photoFileInput.nativeElement.click();
  }

  triggerLayoutFileInput() {
    this.layoutFileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.handlePhotoFile(file);
  }

  onLayoutSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.layoutFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.layoutDataURL = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  handlePhotoFile(file: File) {
    if (file.size > 12 * 1024 * 1024) {
      alert('Photo size exceeds 12MB limit. Please choose a smaller file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        // Calculate crop bounds to make a perfect square centered crop
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Create canvas with high-res dimensions (1024x1024)
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Draw the cropped section scaled to 1024x1024
          ctx.drawImage(img, x, y, size, size, 0, 0, 1024, 1024);
        }

        // Get the high-quality cropped DataURL
        const croppedDataURL = canvas.toDataURL('image/png', 0.95);
        this.photoDataURL = croppedDataURL;

        // Convert canvas back to a file blob to store in this.photoFile for Supabase upload
        canvas.toBlob((blob) => {
          if (blob) {
            this.photoFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + '.png', { type: 'image/png' });
          }
          this.cdr.detectChanges();
        }, 'image/png', 0.95);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave() {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.handlePhotoFile(file);
  }

  resetForm() {
    this.studentForm.reset();
    this.config.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        this.studentForm.get(field.name)?.setValue(field.defaultValue);
      }
    });
    this.photoDataURL = null;
    this.photoFile = null;
    this.layoutDataURL = null;
    this.layoutFile = null;
    if (this.photoFileInput) this.photoFileInput.nativeElement.value = '';
    if (this.layoutFileInput) this.layoutFileInput.nativeElement.value = '';
  }

  // --- Submit & Download ---
  async downloadPNG() {

    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      let firstInvalidLabel = '';
      for (const field of this.config.fields) {
        const control = this.studentForm.get(field.name);
        if (control && control.invalid) {
          firstInvalidLabel = field.label;
          const element = document.getElementById('f_' + field.name);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          break;
        }
      }
      this.displayToast(`⚠ Please fill out the required field: "${firstInvalidLabel}"`);
      return;
    }

    if (!this.photoDataURL) {
      this.displayToast('⚠ Photo is required.');
      const dropZone = document.querySelector('.photo-drop');
      if (dropZone) {
        dropZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.isGenerating = true;
    this.loader.show();
    this.cdr.detectChanges();

    try {
      const cardContainer = this.cardElement.nativeElement;
      const isExportMode = cardContainer.classList.contains('export-mode');
      if (!isExportMode) cardContainer.classList.add('export-mode');

      // Use a slight timeout to let DOM classes apply
      await new Promise(resolve => setTimeout(resolve, 350));

      const canvas = await html2canvas(cardContainer, {
        scale: 6, // High DPI export
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });

      if (!isExportMode) cardContainer.classList.remove('export-mode');

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
      if (!blob) throw new Error('Failed to generate image canvas blob.');

      const values = this.studentForm.value;
      const primaryName = values.studentName || values.name || 'card';
      const secondaryDetail = values.fhName || values.role || 'nscb';
      const safeName = primaryName.trim().replace(/\s+/g, '_');
      const safeDetail = secondaryDetail.trim().replace(/\s+/g, '_');
      const timestamp = Date.now();
      const cardFileName = `${timestamp}-${safeName}_${safeDetail}-card.png`;

      let cardUrl = '';
      let picUrl = '';

      if (this.enableDbUpload) {
        cardUrl = await this.supabase.uploadCard(blob, cardFileName, this.config.storageBucket);

        if (this.photoFile) {
          const photoFileName = `${timestamp}-${safeName}-photo.png`;
          picUrl = await this.supabase.uploadPhoto(this.photoFile, photoFileName, this.config.storageBucket);
        }

        await this.saveRecord({
          ...values,
          cardUrl,
          photoUrl: picUrl
        });

        this.displayToast('✓ Card details saved successfully to database!');
        await this.loadSubmissions();
      }

      if (this.enableLocalDownload) {
        const link = document.createElement('a');
        link.download = `${safeName}_ID_Card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      this.resetForm();
    } catch (err: any) {
      console.error(err);
      this.displayToast('⚠ Error: ' + (err.message || 'Submission failed'));
    } finally {
      this.isGenerating = false;
      this.loader.hide();
      this.cdr.detectChanges();
    }
  }

  async saveRecord(recordData: any) {
    const dbRecord: any = {
      card_url: recordData.cardUrl,
      photo_url: recordData.photoUrl,
      created_at: new Date().toISOString()
    };

    if (this.config.id === 'generator') {
      dbRecord.name = recordData.name;
      dbRecord.role = recordData.role;
      dbRecord.contact = recordData.contact;
      dbRecord.dob = recordData.dob;
      dbRecord.employee_id = recordData.employeeId || '';
      dbRecord.address = recordData.address;
      dbRecord.office_contact = recordData.officeContact;
    } else {
      dbRecord.student_name = recordData.studentName;
      dbRecord.course = recordData.class;
      dbRecord.section = recordData.section || '';
      dbRecord.phone = recordData.phone;
      dbRecord.fh_name = recordData.fhName;
      dbRecord.dob = recordData.dob;
      dbRecord.address = recordData.address;
      dbRecord.session = recordData.session;
      dbRecord.id_no = recordData.idNo;
    }

    // Prune keys that are not defined in config fields (except card_url, photo_url, created_at)
    const fieldNames = new Set(this.config.fields.map(f => f.name));
    const getFormFieldName = (dbName: string): string => {
      const map: Record<string, string> = {
        student_name: 'studentName',
        course: 'class',
        fh_name: 'fhName',
        id_no: 'idNo',
        employee_id: 'employeeId'
      };
      return map[dbName] || dbName;
    };

    Object.keys(dbRecord).forEach(key => {
      if (key === 'card_url' || key === 'photo_url' || key === 'created_at') return;
      const formName = getFormFieldName(key);
      if (!fieldNames.has(formName)) {
        delete dbRecord[key];
      }
    });

    return this.supabase.saveRecord(
      this.config.dbTable, 
      dbRecord, 
      this.config.isSecondaryClient
    );
  }

  async logout() {
    try {
      const isGhs = this.config.isSecondaryClient;
      await this.supabase.signOut(isGhs);
      this.displayToast('Logged out successfully');
      this.router.navigate(['/' + this.config.id]);
    } catch (err) {
      console.error(err);
      this.displayToast('Failed to log out');
    }
  }

  displayToast(message: string) {
    this.toastMessage = message;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 4000);
  }
}
