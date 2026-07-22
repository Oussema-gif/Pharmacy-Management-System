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
import { AuthService } from '../../core/auth.service';
import { BranchService } from '../../core/services/branch.service';
import { Medication } from '../../core/models/medication.model';
import { Branch } from '../../core/models/branch.model';

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
  isAdmin = false;
  branches: Branch[] = [];

  constructor(
    private fb: FormBuilder,
    private medicationService: MedicationService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
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
    this.medicationId = Number(this.route.snapshot.paramMap.get('id'));
    const role = this.authService.getUserRole();
    this.isAdmin = role === 'ADMIN';

    if (this.isAdmin) {
      this.loadBranches();
    } else {
      // Non‑admin: auto‑set branch
      const branchId = this.authService.getUserBranchId();
      this.medicationForm.patchValue({ branchId: branchId });
    }

    if (this.medicationId) {
      this.isEdit = true;
      this.loadMedication();
    }
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

  private loadMedication(): void {
    this.medicationService.getById(this.medicationId!).subscribe({
      next: (med: Medication) => {
        this.medicationForm.patchValue({
          name: med.name,
          genericName: med.genericName || '',
          category: med.category || '',
          unit: med.unit || '',
          barcode: med.barcode || '',
          branchId: med.branchId ?? null
        });
      },
      error: () => {
        this.error = 'Medication not found';
        this.toastService.show('error', this.error);
      }
    });
  }

  onSubmit(): void {
    if (this.medicationForm.invalid) {
      this.medicationForm.markAllAsTouched();
      this.toastService.show('warning', 'Please fill all required fields.');
      return;
    }

    const medData: Medication = this.medicationForm.value;
    const request = this.isEdit && this.medicationId
      ? this.medicationService.update(this.medicationId, medData)
      : this.medicationService.create(medData);

    request.subscribe({
      next: () => {
        this.toastService.show('success', this.isEdit ? 'Medication updated' : 'Medication created');
        this.router.navigate(['/medications']);
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Save failed';
        this.error = msg;
        this.toastService.show('error', msg);
      }
    });
  }
}