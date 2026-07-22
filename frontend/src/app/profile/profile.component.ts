import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  loading = true;
  savingProfile = false;
  changingPassword = false;

  profileError = '';
  profileSuccess = '';
  passwordError = '';
  passwordSuccess = '';

  user: User | null = null;

  readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]]
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
        ]
      ],
      confirmPassword: ['', [Validators.required]]
    },
    {
      validators: [this.passwordMatchValidator()]
    }
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.profileError = '';

    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          fullName: user.fullName,
          email: user.email
        });
        this.loading = false;
      },
      error: (error) => {
        this.profileError =
          error?.error?.message || 'Failed to load your profile.';
        this.loading = false;
      }
    });
  }

  saveProfile(): void {
    this.profileSuccess = '';
    this.profileError = '';

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile = true;

    this.userService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.profileSuccess = 'Profile updated successfully.';
        this.savingProfile = false;
      },
      error: (error) => {
        this.profileError =
          error?.error?.message || 'Unable to update profile.';
        this.savingProfile = false;
      }
    });
  }

  changePassword(): void {
    this.passwordSuccess = '';
    this.passwordError = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.changingPassword = true;

    this.userService.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.passwordSuccess = 'Password changed successfully.';
        this.passwordForm.reset();
        this.changingPassword = false;
      },
      error: (error) => {
        this.passwordError =
          error?.error?.message || 'Unable to change password.';
        this.changingPassword = false;
      }
    });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newPassword = control.get('newPassword')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (!newPassword || !confirmPassword) {
        return null;
      }

      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }
}