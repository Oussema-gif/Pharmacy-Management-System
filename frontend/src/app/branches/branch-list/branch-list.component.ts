import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BranchService } from '../../core/services/branch.service';
import { ToastService } from '../../core/services/toast.service';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './branch-list.component.html',
  styleUrls: []
})
export class BranchListComponent implements OnInit {
  branches: Branch[] = [];
  error = '';

  constructor(
    private branchService: BranchService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: (data: Branch[]) => this.branches = data,
      error: (err: any) => this.error = 'Failed to load branches'
    });
  }

  deleteBranch(id: number) {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.branchService.delete(id).subscribe({
        next: () => {
          this.loadBranches();
          this.toastService.show('success', 'Branch deleted successfully');
        },
        error: (err: any) => {
          const msg = err.error?.message || 'Cannot delete branch.';
          this.toastService.show('error', msg);
        }
      });
    }
  }
}