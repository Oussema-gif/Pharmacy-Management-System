import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';
import { ToastService } from '../../core/services/toast.service';
import { Patient } from '../../core/models/patient.model';
import { Branch } from '../../core/models/branch.model';
import { UserService } from '../../core/services/user.service';
import { BranchService } from '../../core/services/branch.service';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.component.html',
  styleUrls: []
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isEdit = false;
  patientId: number | null = null;
  error = '';
  loading = false;

  isAdmin = false;
  branches: Branch[] = [];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private branchService: BranchService
  ) {
    this.patientForm = this.fb.group({
      fullName: ['', Validators.required],
      phone: [''],
      email: [''],
      address: [''],
      branchId: [null]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.patientId = idParam ? Number(idParam) : null;
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        this.isAdmin = user.role === 'ADMIN';

        const branchControl = this.patientForm.get('branchId');

        if (this.isAdmin) {
          branchControl?.setValidators([Validators.required]);
          branchControl?.updateValueAndValidity();
          this.loadBranches();
        } else {
          branchControl?.clearValidators();
          branchControl?.setValue(null);
          branchControl?.updateValueAndValidity();
        }

        if (this.patientId) {
          this.isEdit = true;
          this.loadPatient();
        }
      },
      error: () => {
        this.error = 'Failed to load user profile';
        this.toastService.show('error', this.error);
      }
    });
  }

  private loadBranches(): void {
    this.branchService.getAll().subscribe({
      next: (data: Branch[]) => {
        this.branches = data;
      },
      error: () => {
        this.toastService.show('error', 'Failed to load branches');
      }
    });
  }

  private loadPatient(): void {
    this.loading = true;

    this.patientService.getById(this.patientId!).subscribe({
      next: (patient: Patient) => {
        this.patientForm.patchValue({
          fullName: patient.fullName,
          phone: patient.phone || '',
          email: patient.email || '',
          address: patient.address || '',
          branchId: patient.branchId ?? null
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Patient not found';
        this.toastService.show('error', this.error);
      }
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      this.toastService.show('warning', 'Please fill all required fields.');
      return;
    }

    const patientData: Patient = this.patientForm.value;

    const request = this.isEdit && this.patientId
      ? this.patientService.update(this.patientId, patientData)
      : this.patientService.create(patientData);

    request.subscribe({
      next: () => {
        this.toastService.show(
          'success',
          this.isEdit ? 'Patient updated' : 'Patient created'
        );
        this.router.navigate(['/patients'], {
          queryParams: { refresh: Date.now() }
        });
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Save failed';
        this.error = msg;
        this.toastService.show('error', msg);
      }
    });
  }
}