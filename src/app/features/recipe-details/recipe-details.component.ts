import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Recipe, RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-recipe-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container mt-5 pt-3" *ngIf="recipe">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/recipes" class="text-decoration-none text-muted">Recipes</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ recipe.category }}</li>
        </ol>
      </nav>

      <div class="row mt-4">
        <div class="col-lg-6 mb-4">
          <img [src]="recipe.imageUrl" class="img-fluid rounded-4 shadow-sm w-100 object-fit-cover" style="height: 400px;" [alt]="recipe.title">
        </div>
        
        <div class="col-lg-6 mb-4">
          <span class="badge bg-secondary mb-3" style="background-color: var(--accent-color) !important; font-size: 0.9rem; padding: 0.5rem 1rem;">{{ recipe.category }}</span>
          <h1 class="display-5 font-outfit mb-3">{{ recipe.title }}</h1>
          
          <div class="d-flex align-items-center mb-4">
            <div class="d-flex text-warning me-2 fs-5">
              <i class="bi bi-star-fill"></i>
            </div>
            <span class="fw-bold fs-5">{{ recipe.rating | number:'1.1-1' }}</span>
            <span class="text-muted ms-2">(Community Rating)</span>
          </div>

          <p class="lead mb-4">{{ recipe.description }}</p>

          <div *ngIf="isLoggedIn" class="card bg-light border-0 rounded-4 p-4 mb-4">
            <h5 class="font-outfit mb-3">Rate this recipe</h5>
            <div class="d-flex align-items-center">
              <div class="rating-stars me-3 fs-3" style="cursor: pointer; color: #e0e0e0;">
                <i class="bi bi-star-fill star-item" *ngFor="let i of [1,2,3,4,5]" 
                   [ngClass]="{'text-warning': i <= currentRating}"
                   (click)="rateRecipe(i)"></i>
              </div>
              <span class="text-muted small" *ngIf="currentRating > 0">You rated it {{ currentRating }} stars!</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-md-4 mb-5">
          <div class="card border-0 shadow-sm rounded-4 p-4 h-100" style="background-color: var(--bg-color);">
            <h3 class="font-outfit mb-4">Ingredients</h3>
            <ul class="list-group list-group-flush bg-transparent">
              <li class="list-group-item bg-transparent border-bottom border-secondary-subtle py-3 px-0 d-flex align-items-center" *ngFor="let item of recipe.ingredients">
                <i class="bi bi-check2-circle text-primary me-3 fs-5"></i>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="col-md-8 mb-5">
          <div class="card border-0 shadow-sm rounded-4 p-4 p-lg-5">
            <h3 class="font-outfit mb-4">Instructions</h3>
            <div class="step-item d-flex mb-4 pb-4 border-bottom" *ngFor="let step of recipe.steps; let i = index">
              <div class="step-number me-4 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px; font-weight: bold; font-family: 'Outfit';">
                {{ i + 1 }}
              </div>
              <div class="step-content pt-2">
                <p class="mb-0 fs-5" style="line-height: 1.6;">{{ step }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="text-center py-5 mt-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div *ngIf="error" class="container text-center mt-5 pt-5">
      <h3 class="text-danger">{{ error }}</h3>
      <a routerLink="/recipes" class="btn btn-outline-primary mt-3">Back to Recipes</a>
    </div>
  `
})
export class RecipeDetailsComponent implements OnInit {
  recipe: Recipe | null = null;
  loading = true;
  error = '';
  isLoggedIn = false;
  currentRating = 0;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoggedIn = !!this.authService.currentUserValue;

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.recipeService.getRecipe(id).subscribe({
          next: (res) => {
            this.recipe = res;
            this.loading = false;
          },
          error: () => {
            this.error = 'Recipe not found.';
            this.loading = false;
          }
        });
      }
    });
  }

  rateRecipe(stars: number) {
    if (!this.recipe) return;
    this.currentRating = stars;
    
    // Simulate updating rating (simple average logic for mock)
    const newRating = this.recipe.rating === 0 ? stars : (this.recipe.rating + stars) / 2;
    const updated = { ...this.recipe, rating: newRating };
    
    this.recipeService.updateRecipe(updated).subscribe(res => {
      this.recipe = res;
    });
  }
}
