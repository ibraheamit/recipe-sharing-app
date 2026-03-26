import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container d-flex justify-content-center align-items-center mt-5 pt-5">
      <div class="card recipe-card p-4" style="max-width: 400px; width: 100%;">
        <h2 class="text-center mb-4">Welcome Back</h2>
        
        <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label for="email" class="form-label">Email address</label>
            <input type="email" id="email" class="form-control" formControlName="email"
                   [ngClass]="{'is-invalid': f['email'].errors && f['email'].touched}">
            <div class="invalid-feedback" *ngIf="f['email'].errors?.['required']">Email is required</div>
            <div class="invalid-feedback" *ngIf="f['email'].errors?.['email']">Must be a valid email</div>
          </div>
          
          <div class="mb-4">
            <label for="password" class="form-label">Password</label>
            <input type="password" id="password" class="form-control" formControlName="password"
                   [ngClass]="{'is-invalid': f['password'].errors && f['password'].touched}">
            <div class="invalid-feedback" *ngIf="f['password'].errors?.['required']">Password is required</div>
          </div>
          
          <button type="submit" class="btn btn-primary w-100" [disabled]="loginForm.invalid || loading">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            Login
          </button>
        </form>
        
        <div class="mt-4 text-center">
          <p class="text-muted mb-0">Don't have an account? <a routerLink="/register">Register here</a></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
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
    
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';
    
    this.authService.login(this.f['email'].value, this.f['password'].value).subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          this.router.navigate(['/']);
        } else {
          this.error = 'User not found. Try registering.';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'An error occurred. Please try again.';
        this.loading = false;
      }
    });
  }
}
