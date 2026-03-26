import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white py-3 shadow-sm sticky-top">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <i class="bi bi-egg-fried text-accent fs-3 me-2" style="color: var(--accent-color)"></i>
          <span class="brand-font fs-4 mb-0">RecipeShare</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link fw-medium" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link fw-medium" routerLink="/recipes" routerLinkActive="active">Recipes</a>
            </li>
          </ul>
          
          <div class="d-flex align-items-center">
            <a routerLink="/add-recipe" class="btn btn-primary me-3">
              <i class="bi bi-plus-lg me-1"></i> Add Recipe
            </a>
            
            <ng-container *ngIf="currentUser$ | async as user; else guestLinks">
              <div class="dropdown">
                <a class="nav-link d-flex align-items-center dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <img [src]="user.avatar" class="rounded-circle me-2 border" style="width: 32px; height: 32px; object-fit: cover;">
                  <span class="fw-medium">{{ user.name }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                  <li><a class="dropdown-item" routerLink="/profile"><i class="bi bi-person me-2"></i>Profile</a></li>
                  <li><a class="dropdown-item" routerLink="/favorites"><i class="bi bi-heart text-danger me-2"></i>Favorites</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="javascript:void(0)" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </div>
            </ng-container>
            
            <ng-template #guestLinks>
              <a routerLink="/login" class="btn btn-outline-secondary me-2">Login</a>
              <a routerLink="/register" class="btn btn-accent">Sign Up</a>
            </ng-template>

            <!-- Dark Mode Toggle -->
            <button class="btn btn-link text-dark ms-3 fs-5" (click)="toggleDarkMode()">
              <i class="bi" [ngClass]="isDarkMode ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class HeaderComponent {
  currentUser$: Observable<User | null>;
  isDarkMode = false;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
    
    // Initialize dark mode from localStorage if present
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  logout() {
    this.authService.logout();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}

