import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Alert, AlertService } from '../../core/services/alert.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { CurrentUser } from '../../core/models/current-user.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrls: []
})
export class AlertsComponent implements OnInit {
  alerts: Alert[] = [];
  currentUser: CurrentUser | null = null;
  loading = true;
  error = '';

  constructor(
    private alertService: AlertService,
    private userService: UserService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUserAndAlerts();
  }

  loadCurrentUserAndAlerts(): void {
    this.loading = true;
    this.error = '';

    this.userService.getProfile().subscribe({
      next: (user: CurrentUser) => {
        this.currentUser = user;
        this.loadAlerts();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to load your profile';
        this.showToast('error', this.error);
      }
    });
  }

  loadAlerts(): void {
    this.loading = true;
    this.error = '';

    if (!this.currentUser) {
      this.loading = false;
      this.error = 'No user context available';
      return;
    }

    const isAdmin = this.currentUser.role === 'ADMIN';

    if (!isAdmin && !this.currentUser.branchId) {
      this.loading = false;
      this.alerts = [];
      this.error = 'Your account is not assigned to any branch.';
      this.showToast('error', this.error);
      return;
    }

    const request$ = this.currentUser.branchId
      ? this.alertService.getByBranch(this.currentUser.branchId)
      : this.alertService.getCurrentScopeAlerts();

    request$.subscribe({
      next: (alerts: Alert[]) => {
        this.alerts = alerts;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alerts = [];
        this.error = err?.error?.message || 'Failed to load alerts';
        this.showToast('error', this.error);
      }
    });
  }

  dismiss(alert: Alert): void {
    this.alertService.markAsRead(alert.id).subscribe({
      next: () => {
        this.alerts = this.alerts.filter((item) => item.id !== alert.id);
        this.showToast('info', 'Alert marked as read');
      },
      error: (err: any) => {
        this.showToast('error', err?.error?.message || 'Failed to update alert');
      }
    });
  }

  get scopeLabel(): string {
    if (!this.currentUser) {
      return '';
    }

    if (this.currentUser.role === 'ADMIN') {
      return this.currentUser.branchName
        ? `Admin view · Branch: ${this.currentUser.branchName}`
        : 'All branches';
    }

    return this.currentUser.branchName
      ? `Branch: ${this.currentUser.branchName}`
      : 'My branch';
  }

  private showToast(type: string, message: string): void {
    const toast = this.toastService as unknown as {
      show?: (type: string, message: string) => void;
      showError?: (message: string) => void;
      showSuccess?: (message: string) => void;
      error?: (message: string) => void;
    };

    if (type === 'error' && toast.showError) {
      toast.showError(message);
      return;
    }

    if (toast.show) {
      toast.show(type, message);
      return;
    }

    if (type === 'error' && toast.error) {
      toast.error(message);
    }
  }
}