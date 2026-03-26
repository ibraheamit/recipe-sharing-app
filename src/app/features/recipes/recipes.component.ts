import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Recipe, RecipeService } from '../../core/services/recipe.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecipeCardComponent],
  template: `
    <div class="container mt-5 pt-3">
      <div class="text-center mb-5">
        <h1 class="display-4 font-outfit">Explore Recipes</h1>
        <p class="text-muted lead">Find your next culinary adventure.</p>
      </div>

      <div class="row mb-5 justify-content-center">
        <div class="col-md-8">
          <div class="card p-3 shadow-sm border-0 bg-white" style="border-radius: 1rem;">
            <div class="row g-2">
              <div class="col-md-8">
                <div class="position-relative">
                  <i class="bi bi-search position-absolute text-muted" style="left: 15px; top: 12px;"></i>
                  <input type="text" class="form-control form-control-lg bg-light border-0 ps-5" 
                         [formControl]="searchControl" placeholder="Search by name or ingredient...">
                </div>
              </div>
              <div class="col-md-4">
                <select class="form-select form-select-lg bg-light border-0" [formControl]="categoryControl">
                  <option value="All">All Categories</option>
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div class="row g-4" *ngIf="!loading">
        <div class="col-12 col-md-6 col-lg-3" *ngFor="let recipe of recipes">
          <app-recipe-card 
            [recipe]="recipe" 
            [isFavorite]="isFav(recipe.id)"
            (favoriteToggle)="onToggleFavorite($event)">
          </app-recipe-card>
        </div>
        
        <div class="col-12 text-center py-5" *ngIf="recipes.length === 0">
          <div class="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style="width: 80px; height: 80px;">
            <i class="bi bi-search text-muted fs-2"></i>
          </div>
          <h4 class="text-muted">No recipes found</h4>
          <p class="text-muted">Try adjusting your search or category filters.</p>
          <button class="btn btn-outline-primary mt-2" (click)="resetFilters()">Reset Filters</button>
        </div>
      </div>
    </div>
  `
})
export class RecipesComponent implements OnInit {
  recipes: Recipe[] = [];
  loading = true;
  
  categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegan', 'Vegetarian', 'Snack', 'Drink'];
  
  searchControl = new FormControl('');
  categoryControl = new FormControl('All');

  userFavorites: Record<string, string> = {}; // recipeId -> favoriteId
  currentUserId: string | null = null;

  constructor(
    private recipeService: RecipeService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.currentUserValue?.id || null;
    
    if (this.currentUserId) {
      this.favoriteService.getUserFavorites(this.currentUserId).subscribe(favs => {
        favs.forEach(f => this.userFavorites[f.recipeId] = f.id);
      });
    }

    // Load initial from query params
    this.route.queryParams.subscribe(params => {
      const cat = params['category'];
      if (cat && this.categories.includes(cat)) {
        this.categoryControl.setValue(cat, { emitEvent: false });
      }
      this.loadRecipes();
    });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.loadRecipes());

    this.categoryControl.valueChanges.subscribe(val => {
      // Update URL silently
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: val === 'All' ? {} : { category: val },
        queryParamsHandling: 'merge'
      });
      this.loadRecipes();
    });
  }

  loadRecipes() {
    this.loading = true;
    const search = this.searchControl.value || undefined;
    const cat = this.categoryControl.value || undefined;
    
    this.recipeService.getRecipes(cat, search).subscribe(res => {
      this.recipes = res;
      this.loading = false;
    });
  }

  resetFilters() {
    this.searchControl.setValue('', { emitEvent: false });
    this.categoryControl.setValue('All');
  }

  isFav(recipeId: string): boolean {
    return !!this.userFavorites[recipeId];
  }

  onToggleFavorite(recipe: Recipe) {
    if (!this.currentUserId) {
      alert('Please log in to save favorites.');
      return;
    }
    
    if (this.isFav(recipe.id)) {
      const favId = this.userFavorites[recipe.id];
      this.favoriteService.removeFavorite(favId).subscribe(() => {
        delete this.userFavorites[recipe.id];
      });
    } else {
      this.favoriteService.addFavorite(this.currentUserId, recipe.id).subscribe(newFav => {
        this.userFavorites[recipe.id] = newFav.id;
      });
    }
  }
}
