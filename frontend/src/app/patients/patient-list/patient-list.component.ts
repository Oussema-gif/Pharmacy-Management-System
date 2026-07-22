import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';
import { ToastService } from '../../core/services/toast.service';
import { ExportService } from '../../core/services/export.service';
import { AuthService } from '../../core/auth.service';
import { Patient } from '../../core/models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-list.component.html',
  styleUrls: []
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  loading = true;
  error = '';

  constructor(
    private patientService: PatientService,
    private toastService: ToastService,
    private exportService: ExportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = '';

    const isAdmin = this.authService.getUserRole() === 'ADMIN';
    const branchId = this.authService.getUserBranchId();

    const request = isAdmin
      ? this.patientService.getAll()
      : this.patientService.getAll(branchId!);

    request.subscribe({
      next: (data: Patient[]) => {
        this.patients = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load patients';
        this.toastService.show('error', this.error);
      }
    });
  }

  deletePatient(id: number): void {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    this.patientService.delete(id).subscribe({
      next: () => {
        this.patients = this.patients.filter(p => p.id !== id);
        this.toastService.show('success', 'Patient deleted successfully');
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Cannot delete patient.';
        this.toastService.show('error', msg);
      }
    });
  }

  exportPatients(): void {
    const columns = ['id', 'fullName', 'phone', 'email', 'address', 'branchName'];
    this.exportService.downloadCsv(this.patients, 'patients', columns);
    this.toastService.show('success', 'Patients exported');
  }
}