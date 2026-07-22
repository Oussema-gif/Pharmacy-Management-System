import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MedicationService } from '../../core/services/medication.service';
import { ToastService } from '../../core/services/toast.service';
import { ExportService } from '../../core/services/export.service';
import { UserService } from '../../core/services/user.service';
import { Medication } from '../../core/models/medication.model';
import { CurrentUser } from '../../core/models/current-user.model';

@Component({
  selector: 'app-medication-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './medication-list.component.html',
  styleUrls: []
})
export class MedicationListComponent implements OnInit {
  medications: Medication[] = [];
  currentUser: CurrentUser | null = null;
  loadingProfile = true;
  loading = false;
  error = '';

  constructor(
    private medicationService: MedicationService,
    private toastService: ToastService,
    private exportService: ExportService,
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.loadingProfile = true;
    this.userService.getProfile().subscribe({
      next: (user: CurrentUser) => {
        this.currentUser = user;
        this.loadingProfile = false;
        this.loadMedications();
      },
      error: (err: any) => {
        this.loadingProfile = false;
        this.error = err?.error?.message || 'Failed to load user profile';
        this.toastService.show('error', this.error);
      }
    });
  }

  loadMedications(): void {
    this.loading = true;
    this.error = '';

    const isAdmin = this.currentUser?.role === 'ADMIN';
    const branchId = this.currentUser?.branchId;

    const request = isAdmin
      ? this.medicationService.getAll()   // admin sees all
      : this.medicationService.getAll(branchId!); // non‑admin sees only own branch

    request.subscribe({
      next: (data: Medication[]) => {
        this.medications = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to load medications';
        this.toastService.show('error', this.error);
      }
    });
  }

  deleteMedication(id: number): void {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    this.medicationService.delete(id).subscribe({
      next: () => {
        this.medications = this.medications.filter(m => m.id !== id);
        this.toastService.show('success', 'Medication deleted successfully');
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Cannot delete medication.';
        this.toastService.show('error', msg);
      }
    });
  }

  exportMedications(): void {
    const columns = ['id', 'name', 'genericName', 'category', 'unit', 'barcode', 'branchName'];
    this.exportService.downloadCsv(this.medications, 'medications', columns);
    this.toastService.show('success', 'Medications exported');
  }

  isAdmin(): boolean {
    return !!this.currentUser && this.currentUser.role === 'ADMIN';
  }

  get scopeLabel(): string {
    if (!this.currentUser) return '';
    if (this.isAdmin()) {
      return this.currentUser.branchName
        ? `Admin view · Branch: ${this.currentUser.branchName}`
        : 'All branches';
    }
    return this.currentUser.branchName
      ? `Branch: ${this.currentUser.branchName}`
      : 'My branch';
  }

  trackByMedicationId(index: number, med: Medication): number | string {
    return med.id ?? index;
  }
}