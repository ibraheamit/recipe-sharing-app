import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { Recipe, RecipeService } from '../../core/services/recipe.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mt-5 pt-4 mb-5">
      <div class="row">
        <!-- Profile Settings Column -->
        <div class="col-lg-4 mb-4 mb-lg-0">
          <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5">
            <div class="text-center mb-4">
              <div class="position-relative d-inline-block">
                <img [src]="profileForm.get('avatar')?.value || 'https://via.placeholder.com/150'" 
                     class="rounded-circle object-fit-cover shadow-sm mb-3" 
                     style="width: 120px; height: 120px; border: 4px solid var(--accent-color);">
              </div>
              <h3 class="font-outfit mb-1">{{ currentUser?.name }}</h3>
              <p class="text-muted small">{{ currentUser?.email }}</p>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label class="form-label text-muted small fw-bold">Display Name</label>
                <input type="text" class="form-control bg-light border-0" formControlName="name">
              </div>

              <div class="mb-3">
                <label class="form-label text-muted small fw-bold">Avatar URL</label>
                <input type="text" class="form-control bg-light border-0" formControlName="avatar">
              </div>

              <div class="mb-4">
                <label class="form-label text-muted small fw-bold">Bio</label>
                <textarea class="form-control bg-light border-0" rows="3" formControlName="bio"></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-100" [disabled]="loading || profileForm.pristine">
                <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                Save Changes
              </button>

              <div *ngIf="successMessage" class="alert alert-success mt-3 small py-2">{{ successMessage }}</div>
              <div *ngIf="error" class="alert alert-danger mt-3 small py-2">{{ error }}</div>
            </form>
          </div>
        </div>

        <!-- My Recipes Column -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 h-100 bg-light">
            <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-dark-subtle">
              <h3 class="font-outfit m-0">My Recipes</h3>
              <a routerLink="/add-recipe" class="btn btn-sm btn-accent rounded-pill px-3">
                <i class="bi bi-plus-lg me-1"></i> New Recipe
              </a>
            </div>

            <div *ngIf="loadingRecipes" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
            </div>

            <div *ngIf="!loadingRecipes && myRecipes.length === 0" class="text-center py-5">
              <div class="d-inline-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm mb-3" style="width: 70px; height: 70px;">
                <i class="bi bi-journal-plus text-muted fs-2"></i>
              </div>
              <h5 class="text-muted font-outfit">You haven't shared any recipes yet</h5>
              <p class="text-muted small">Share your favorite dish with the community!</p>
            </div>

            <div class="row g-4" *ngIf="!loadingRecipes && myRecipes.length > 0">
              <div class="col-md-6" *ngFor="let recipe of myRecipes">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden recipe-card">
                  <div class="position-relative">
                    <img [src]="recipe.imageUrl" class="card-img-top object-fit-cover" style="height: 180px;" [alt]="recipe.title">
                    <span class="badge bg-dark position-absolute top-0 start-0 m-3">{{ recipe.category }}</span>
                  </div>
                  <div class="card-body p-4 d-flex flex-column">
                    <h5 class="card-title font-outfit fw-bold mb-2 text-truncate">{{ recipe.title }}</h5>
                    <p class="card-text text-muted small mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                      {{ recipe.description }}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-auto border-top pt-3">
                      <div class="text-warning small fw-bold">
                        <i class="bi bi-star-fill me-1"></i>{{ recipe.rating | number:'1.1-1' }}
                      </div>
                      <div>
                        <a [routerLink]="['/edit-recipe', recipe.id]" class="btn btn-sm btn-outline-primary rounded-pill me-2 px-3 hover-lift">
                          <i class="bi bi-pencil"></i> Edit
                        </a>
                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3 hover-lift" (click)="deleteRecipe(recipe)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recipe-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .recipe-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
    .hover-lift { transition: transform 0.1s; }
    .hover-lift:active { transform: scale(0.95); }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  loading = false;
  successMessage = '';
  error = '';
  
  myRecipes: Recipe[] = [];
  loadingRecipes = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileForm = this.formBuilder.group({
      name: [this.currentUser.name, Validators.required],
      avatar: [this.currentUser.avatar],
      bio: [this.currentUser.bio]
    });

    this.loadMyRecipes();
  }

  loadMyRecipes() {
    this.loadingRecipes = true;
    this.recipeService.getRecipesByUserId(this.currentUser!.id).subscribe(recipes => {
      // Sort by creation date if available, otherwise just use order
      this.myRecipes = recipes.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
      this.loadingRecipes = false;
    });
  }

  deleteRecipe(recipe: Recipe) {
    const confirmDelete = confirm(`Are you sure you want to delete "${recipe.title}"?`);
    if (confirmDelete) {
      this.recipeService.deleteRecipe(recipe.id).subscribe(() => {
        // UI updates instantly
        this.myRecipes = this.myRecipes.filter(r => r.id !== recipe.id);
        alert('Recipe deleted successfully');
      }, () => {
        alert('Failed to delete recipe. Please try again.');
      });
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.error = '';

    const updatedData = { ...this.currentUser, ...this.profileForm.value };
    
    this.authService.updateProfile(updatedData as User)
      .pipe(delay(500)) // simulate network delay
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.successMessage = 'Profile updated successfully!';
          this.loading = false;
          this.profileForm.markAsPristine();
        },
        error: () => {
          this.error = 'Failed to update profile. Please try again.';
          this.loading = false;
        }
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
