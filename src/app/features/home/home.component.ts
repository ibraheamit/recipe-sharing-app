import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, filter, map, tap } from 'rxjs';
import { Recipe, RecipeService } from '../../core/services/recipe.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RecipeCardComponent],
  template: `
    <!-- Hero Section -->
    <section class="hero-section text-center py-5 d-flex align-items-center mb-5" style="background: linear-gradient(rgba(74, 93, 78, 0.8), rgba(74, 93, 78, 0.9)), url('https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=1600&q=80') center/cover; min-height: 400px; color: white;">
      <div class="container">
        <h1 class="display-3 fw-bold mb-3 font-outfit" style="color: white">Cooking made simple.</h1>
        <p class="lead mb-4 mx-auto" style="max-width: 600px;">Discover thousands of recipes shared by food lovers around the world, or share your own culinary masterpiece.</p>
        <div class="d-flex justify-content-center gap-3">
          <a routerLink="/recipes" class="btn btn-accent btn-lg px-4 shadow-sm">Explore Recipes</a>
          <a routerLink="/add-recipe" class="btn btn-outline-light btn-lg px-4 shadow-sm">Share a Recipe</a>
        </div>
      </div>
    </section>

    <!-- Top Rated Recipes -->
    <div class="container">
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="h3 mb-1">Top Rated Recipes</h2>
          <p class="text-muted mb-0">Our most beloved dishes chosen by the community.</p>
        </div>
        <a routerLink="/recipes" class="btn btn-outline-primary btn-sm d-none d-md-inline-block">View All</a>
      </div>
      
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div class="row g-4 mb-5" *ngIf="!loading">
        <div class="col-12 col-md-6 col-lg-3" *ngFor="let recipe of topRecipes">
          <app-recipe-card 
            [recipe]="recipe" 
            [isFavorite]="isFav(recipe.id)"
            (favoriteToggle)="onToggleFavorite($event)">
          </app-recipe-card>
        </div>
        <div class="col-12 text-center mt-5" *ngIf="topRecipes.length === 0">
          <p class="text-muted">No recipes found. Be the first to add one!</p>
        </div>
      </div>

      <!-- Categories preview -->
      <div class="row text-center my-5 py-5 bg-white rounded-4 shadow-sm mx-0">
        <h3 class="mb-4">Explore by Category</h3>
        <div class="col-4 col-md-2 mb-3 mx-auto">
          <a routerLink="/recipes" [queryParams]="{category: 'Breakfast'}" class="text-decoration-none">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-2" style="width: 80px; height: 80px; transition: transform 0.2s;">
              <i class="bi bi-cup-hot fs-2 text-primary"></i>
            </div>
            <span class="text-dark fw-medium">Breakfast</span>
          </a>
        </div>
        <div class="col-4 col-md-2 mb-3 mx-auto">
          <a routerLink="/recipes" [queryParams]="{category: 'Lunch'}" class="text-decoration-none">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-2" style="width: 80px; height: 80px; transition: transform 0.2s;">
              <i class="bi bi-egg fs-2 text-primary"></i>
            </div>
            <span class="text-dark fw-medium">Lunch</span>
          </a>
        </div>
        <div class="col-4 col-md-2 mb-3 mx-auto">
          <a routerLink="/recipes" [queryParams]="{category: 'Dinner'}" class="text-decoration-none">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-2" style="width: 80px; height: 80px; transition: transform 0.2s;">
              <i class="bi bi-magic fs-2 text-primary"></i>
            </div>
            <span class="text-dark fw-medium">Dinner</span>
          </a>
        </div>
        <div class="col-4 col-md-2 mb-3 mx-auto">
          <a routerLink="/recipes" [queryParams]="{category: 'Dessert'}" class="text-decoration-none">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-2" style="width: 80px; height: 80px; transition: transform 0.2s;">
              <i class="bi bi-cake fs-2 text-primary"></i>
            </div>
            <span class="text-dark fw-medium">Dessert</span>
          </a>
        </div>
        <div class="col-4 col-md-2 mb-3 mx-auto">
          <a routerLink="/recipes" [queryParams]="{category: 'Vegan'}" class="text-decoration-none">
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-2" style="width: 80px; height: 80px; transition: transform 0.2s;">
              <i class="bi bi-flower1 fs-2 text-primary"></i>
            </div>
            <span class="text-dark fw-medium">Vegan</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  topRecipes: Recipe[] = [];
  loading = true;
  userFavorites: Record<string, string> = {}; // recipeId -> favoriteId
  currentUserId: string | null = null;

  constructor(
    private recipeService: RecipeService,
    private favoriteService: FavoriteService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.currentUserValue?.id || null;
    
    this.recipeService.getRecipes().subscribe(recipes => {
      // Sort by rating descending and take top 4
      this.topRecipes = recipes.sort((a, b) => b.rating - a.rating).slice(0, 4);
      this.loading = false;
    });

    if (this.currentUserId) {
      this.favoriteService.getUserFavorites(this.currentUserId).subscribe(favs => {
        favs.forEach(f => this.userFavorites[f.recipeId] = f.id);
      });
    }
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
