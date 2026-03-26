import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container d-flex justify-content-center align-items-center mt-5 pt-3">
      <div class="card recipe-card p-4" style="max-width: 500px; width: 100%;">
        <h2 class="text-center mb-4">Join Us!</h2>
        
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="name" class="form-label">Full Name</label>
            <input type="text" id="name" class="form-control" formControlName="name"
                   [ngClass]="{'is-invalid': f['name'].errors && f['name'].touched}">
            <div class="invalid-feedback">Name is required</div>
          </div>
          
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" id="email" class="form-control" formControlName="email"
                   [ngClass]="{'is-invalid': f['email'].errors && f['email'].touched}">
            <div class="invalid-feedback" *ngIf="f['email'].errors?.['required']">Email is required</div>
            <div class="invalid-feedback" *ngIf="f['email'].errors?.['email']">Must be a valid email</div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" id="password" class="form-control" formControlName="password"
                   [ngClass]="{'is-invalid': f['password'].errors && f['password'].touched}">
            <div class="invalid-feedback" *ngIf="f['password'].errors?.['required']">Password is required</div>
            <div class="invalid-feedback" *ngIf="f['password'].errors?.['minlength']">Password must be at least 6 characters</div>
          </div>

          <div class="mb-3">
            <label for="avatar" class="form-label">Avatar URL (Optional)</label>
            <input type="text" id="avatar" class="form-control" formControlName="avatar">
          </div>

          <div class="mb-4">
            <label for="bio" class="form-label">Bio (Optional)</label>
            <textarea id="bio" rows="2" class="form-control" formControlName="bio"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary w-100" [disabled]="registerForm.invalid || loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Register
          </button>
        </form>
        
        <div class="mt-4 text-center">
          <p class="text-muted mb-0">Already have an account? <a routerLink="/login">Login here</a></p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      avatar: [''],
      bio: ['']
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.error = '';

    // Simulate avatar logic
    const userVal = this.registerForm.value;
    if (!userVal.avatar) {
      userVal.avatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userVal.name);
    }
    
    this.authService.register(userVal).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.error = 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
