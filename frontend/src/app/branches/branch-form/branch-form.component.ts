import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BranchService } from '../../core/services/branch.service';
import { ToastService } from '../../core/services/toast.service';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './branch-form.component.html',
  styleUrls: []
})
export class BranchFormComponent implements OnInit {
  branchForm: FormGroup;
  isEdit = false;
  branchId: number | null = null;
  error = '';

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.branchForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.branchId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.branchId) {
      this.isEdit = true;
      this.branchService.getById(this.branchId).subscribe({
        next: (branch: Branch) => this.branchForm.patchValue(branch),
        error: (err: any) => this.error = 'Branch not found'
      });
    }
  }

  onSubmit() {
    if (this.branchForm.invalid) return;

    const branchData: Branch = this.branchForm.value;
    const request = this.isEdit && this.branchId
      ? this.branchService.update(this.branchId, branchData)
      : this.branchService.create(branchData);

    request.subscribe({
      next: () => {
        this.toastService.show('success', this.isEdit ? 'Branch updated' : 'Branch created');
        this.router.navigate(['/branches']);
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Save failed';
        this.error = msg;
        this.toastService.show('error', msg);
      }
    });
  }
}