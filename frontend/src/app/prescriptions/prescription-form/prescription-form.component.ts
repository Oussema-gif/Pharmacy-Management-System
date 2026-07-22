import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PrescriptionService } from '../../core/services/prescription.service';
import { PatientService } from '../../core/services/patient.service';
import { MedicationService } from '../../core/services/medication.service';
import { ToastService } from '../../core/services/toast.service';
import { Patient } from '../../core/models/patient.model';
import { Medication } from '../../core/models/medication.model';

@Component({
  selector: 'app-prescription-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './prescription-form.component.html',
  styleUrls: []
})
export class PrescriptionFormComponent implements OnInit {
  prescriptionForm: FormGroup;
  patients: Patient[] = [];
  medications: Medication[] = [];
  loading = true;
  saving = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private medicationService: MedicationService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.prescriptionForm = this.fb.group({
      patientId: [null, Validators.required],
      doctorName: ['', Validators.required],
      date: [new Date().toISOString().slice(0, 10), Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  get items(): FormArray {
    return this.prescriptionForm.get('items') as FormArray;
  }

  loadFormData(): void {
    this.loading = true;

    this.patientService.getAll().subscribe({
      next: (patients: Patient[]) => {
        this.patients = patients;

        this.medicationService.getAll().subscribe({
          next: (medications: Medication[]) => {
            this.medications = medications;
            if (this.items.length === 0) {
              this.addItem();
            }
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.toastService.show('error', 'Failed to load medications');
          }
        });
      },
      error: () => {
        this.loading = false;
        this.toastService.show('error', 'Failed to load patients');
      }
    });
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      medicationId: [null, Validators.required],
      dosage: ['', Validators.required],
      duration: ['']
    });

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    if (this.items.length === 1) {
      return;
    }

    this.items.removeAt(index);
  }

  onSubmit(): void {
    if (this.prescriptionForm.invalid) {
      this.prescriptionForm.markAllAsTouched();
      this.toastService.show('warning', 'Please fill all required fields.');
      return;
    }

    this.saving = true;
    this.error = '';

    this.prescriptionService.create(this.prescriptionForm.value).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.show('success', 'Prescription created');
        this.router.navigate(['/prescriptions']);
      },
      error: (err: any) => {
        this.saving = false;
        const msg = err.error?.message || 'Failed to create prescription';
        this.error = msg;
        this.toastService.show('error', msg);
      }
    });
  }
}