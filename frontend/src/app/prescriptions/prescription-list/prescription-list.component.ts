import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrescriptionService } from '../../core/services/prescription.service';
import { ToastService } from '../../core/services/toast.service';
import { Prescription } from '../../core/models/prescription.model';

@Component({
  selector: 'app-prescription-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './prescription-list.component.html',
  styleUrls: []
})
export class PrescriptionListComponent implements OnInit {
  prescriptions: Prescription[] = [];
  loading = true;
  error = '';

  constructor(
    private prescriptionService: PrescriptionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.loading = true;
    this.error = '';

    this.prescriptionService.getAll().subscribe({
      next: (data: Prescription[]) => {
        this.prescriptions = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load prescriptions';
        this.toastService.show('error', this.error);
      }
    });
  }

  deletePrescription(id: number): void {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    this.prescriptionService.delete(id).subscribe({
      next: () => {
        this.prescriptions = this.prescriptions.filter((item) => item.id !== id);
        this.toastService.show('success', 'Prescription deleted');
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Cannot delete prescription.';
        this.toastService.show('error', msg);
      }
    });
  }
}