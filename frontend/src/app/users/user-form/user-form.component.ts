import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { BranchService } from '../../core/services/branch.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';
import { Branch } from '../../core/models/branch.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrls: []
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEdit = false;
  userId: number | null = null;
  branches: Branch[] = [];
  error = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private branchService: BranchService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role: ['', Validators.required],
      branchId: [null]
    });
  }

  ngOnInit(): void {
    this.loadBranches();
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.userId) {
      this.isEdit = true;
      this.userService.getById(this.userId).subscribe({
        next: (user: User) => this.userForm.patchValue({...user, password: ''}),
        error: (err: any) => this.error = 'User not found'
      });
    }
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: (data: Branch[]) => this.branches = data,
      error: () => {}
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    const userData: User = this.userForm.value;
    if (!this.isEdit && !userData.password) {
      this.error = 'Password is required';
      return;
    }

    const request = this.isEdit && this.userId
      ? this.userService.update(this.userId, userData)
      : this.userService.create(userData);

    request.subscribe({
      next: () => {
        this.toastService.show('success', this.isEdit ? 'User updated' : 'User created');
        this.router.navigate(['/users']);
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Save failed';
        this.error = msg;
        this.toastService.show('error', msg);
      }
    });
  }
}