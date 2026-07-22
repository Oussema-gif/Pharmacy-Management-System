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
import { MedicationService } from '../../core/services/medication.service';
import { ToastService } from '../../core/services/toast.service';
import { Medication } from '../../core/models/medication.model';
import { UserService } from '../../core/services/user.service';
import { CurrentUser } from '../../core/models/current-user.model';
import { BranchService } from '../../core/services/branch.service';

@Component({
  selector: 'app-medication-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './medication-form.component.html',
  styleUrls: []
})
export class MedicationFormComponent implements OnInit {
  medicationForm: FormGroup;
  isEdit = false;
  medicationId: number | null = null;
  error = '';

  currentUser: CurrentUser | null = null;
  branches: any[] = [];
  isAdmin = false;
  loadingProfile = true;
  loadingBranches = false;
  loadingMedication = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private medicationService: MedicationService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private branchService: BranchService
  ) {
    this.medicationForm = this.fb.group({
      name: ['', Validators.required],
      genericName: [''],
      category: [''],
      unit: [''],
      barcode: [''],
      branchId: [null]
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user: CurrentUser) => {
        this.currentUser = user;
        this.isAdmin = user.role === 'ADMIN';
        this.loadingProfile = false;

        if (this.isAdmin) {
          this.medicationForm.get('branchId')?.setValidators([Validators.required]);
          this.medicationForm.get('branchId')?.updateValueAndValidity();
          this.loadBranches();
        } else {
          if (!user.branchId) {
            this.error = 'Your account is not assigned to any branch.';
            this.toastService.show('error', this.error);
            return;
          }

          this.medicationForm.patchValue({ branchId: user.branchId });
        }

        this.loadMedicationIfEdit();
      },
      error: (err: any) => {
        this.loadingProfile = false;
        this.error = err?.error?.message || err?.error || 'Failed to load user profile';
        this.toastService.show('error', this.error);
      }
    });
  }

  private loadBranches(): void {
    this.loadingBranches = true;

    this.branchService.getAll().subscribe({
      next: (data: any[]) => {
        this.branches = data;
        this.loadingBranches = false;
      },
      error: (err: any) => {
        this.loadingBranches = false;
        this.error = err?.error?.message || err?.error || 'Failed to load branches';
        this.toastService.show('error', this.error);
      }
    });
  }

  private loadMedicationIfEdit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.medicationId = rawId ? Number(rawId) : null;

    if (this.medicationId) {
      this.isEdit = true;
      this.loadingMedication = true;

      this.medicationService.getById(this.medicationId).subscribe({
        next: (med: Medication) => {
          this.medicationForm.patchValue({
            name: med.name,
            genericName: med.genericName ?? '',
            category: med.category ?? '',
            unit: med.unit ?? '',
            barcode: med.barcode ?? '',
            branchId: med.branchId ?? null
          });
          this.loadingMedication = false;
        },
        error: (err: any) => {
          this.loadingMedication = false;
          this.error = err?.error?.message || err?.error || 'Medication not found';
          this.toastService.show('error', this.error);
        }
      });
    }
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.toastService.show('error', 'No user context available.');
      return;
    }

    if (!this.isAdmin) {
      this.medicationForm.patchValue({
        branchId: this.currentUser.branchId ?? null
      });
    }

    if (this.medicationForm.invalid) {
      this.medicationForm.markAllAsTouched();
      this.toastService.show('warning', 'Please complete all required fields.');
      return;
    }

    const medData: Medication = this.medicationForm.getRawValue();

    const request = this.isEdit && this.medicationId
      ? this.medicationService.update(this.medicationId, medData)
      : this.medicationService.create(medData);

    this.saving = true;

    request.subscribe({
      next: () => {
        this.saving = false;
        this.toastService.show(
          'success',
          this.isEdit ? 'Medication updated' : 'Medication created'
        );
        this.router.navigate(['/medications'], {
          queryParams: { refresh: Date.now() }
        });
      },
      error: (err: any) => {
        this.saving = false;
        const msg = err?.error?.message || err?.error || 'Save failed';
        this.error = msg;
        this.toastService.show('error', msg);
      }
    });
  }
}