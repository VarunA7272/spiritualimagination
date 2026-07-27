import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { SupabaseService } from '../../services/supabase.service';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicGeneratorComponent } from './dynamic-generator';

describe('DynamicGeneratorComponent', () => {
  let component: DynamicGeneratorComponent;
  let supabaseMock: any;
  let routerMock: any;

  beforeEach(async () => {
    supabaseMock = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      signOut: vi.fn(),
      uploadCard: vi.fn(),
      uploadPhoto: vi.fn(),
      saveStudentRecord: vi.fn(),
      saveEmployeeRecord: vi.fn(),
      saveGhsPalasundarRecord: vi.fn(),
      getStudentNames: vi.fn().mockResolvedValue([]),
      getEmployeeNames: vi.fn().mockResolvedValue([]),
      getGhsPalasundarStudentNames: vi.fn().mockResolvedValue([])
    };

    routerMock = {
      navigate: vi.fn(),
      url: '/student-card'
    };

    const activatedRouteMock = {
      snapshot: {
        queryParams: {},
        data: { mode: 'student-card' }
      }
    };

    await TestBed.configureTestingModule({
      imports: [DynamicGeneratorComponent, ReactiveFormsModule],
      providers: [
        { provide: SupabaseService, useValue: supabaseMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(DynamicGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form group dynamically with fields', () => {
    expect(component.studentForm).toBeDefined();
    expect(component.studentForm.get('studentName')).toBeDefined();
    expect(component.studentForm.get('class')).toBeDefined();
    expect(component.studentForm.get('phone')).toBeDefined();
  });

  it('should validate inputs correctly', () => {
    const nameControl = component.studentForm.get('studentName');
    nameControl?.setValue('');
    expect(nameControl?.valid).toBe(false);

    nameControl?.setValue('ab');
    expect(nameControl?.valid).toBe(false);

    nameControl?.setValue('Rahul Sharma');
    expect(nameControl?.valid).toBe(true);

    const phoneControl = component.studentForm.get('phone');
    phoneControl?.setValue('9876543210');
    expect(phoneControl?.valid).toBe(true);
  });

  it('should reset form group on resetForm()', () => {
    component.studentForm.patchValue({
      studentName: 'Rahul Sharma',
      class: '10',
      section: 'A',
      phone: '9876543210',
      fhName: 'Mr. Rajesh Sharma',
      dob: '2010-02-24',
      session: '2026-2027',
      idNo: 'MPS/26/101',
      address: 'Suhagi, Jabalpur M.P.'
    });

    component.resetForm();

    expect(component.studentForm.get('studentName')?.value).toBeNull();
    expect(component.studentForm.get('class')?.value).toBe('LKG');
  });
});
