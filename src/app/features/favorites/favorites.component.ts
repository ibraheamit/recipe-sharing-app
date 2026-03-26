import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Recipe, RecipeService } from '../../core/services/recipe.service';
import { FavoriteService, Favorite } from '../../core/services/favorite.service';
import { AuthService } from '../../core/services/auth.service';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RecipeCardComponent, RouterLink],
  template: `
    <div class="container mt-5 pt-3">
      <div class="text-center mb-5">
        <h1 class="display-4 font-outfit">Your Saved Recipes</h1>
        <p class="text-muted lead">All the community recipes you love in one place.</p>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div class="row g-4" *ngIf="!loading">
        <div class="col-12 col-md-6 col-lg-3" *ngFor="let recipe of favoriteRecipes">
          <app-recipe-card 
            [recipe]="recipe" 
            [isFavorite]="true"
            (favoriteToggle)="onToggleFavorite($event)">
          </app-recipe-card>
        </div>
        
        <div class="col-12 text-center py-5 mt-4" *ngIf="favoriteRecipes.length === 0">
          <div class="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style="width: 80px; height: 80px;">
            <i class="bi bi-heart text-muted fs-2"></i>
          </div>
          <h4 class="text-muted">No favorites yet</h4>
          <p class="text-muted">Start exploring and save recipes you'd like to try!</p>
          <a routerLink="/recipes" class="btn btn-outline-primary mt-2">Discover Recipes</a>
        </div>
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  favoriteRecipes: Recipe[] = [];
  loading = true;
  userFavorites: Record<string, string> = {}; // recipeId -> favoriteId
  currentUserId: string | null = null;

  constructor(
    private recipeService: RecipeService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.currentUserValue?.id || null;
    
    if (!this.currentUserId) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadFavorites();
  }

  loadFavorites() {
    this.loading = true;
    if (!this.currentUserId) return;

    // Fetch user favorites
    this.favoriteService.getUserFavorites(this.currentUserId).subscribe(favs => {
      this.userFavorites = {};
      favs.forEach(f => this.userFavorites[f.recipeId] = f.id);

      if (favs.length === 0) {
        this.favoriteRecipes = [];
        this.loading = false;
        return;
      }

      // Fetch all recipes and filter (mock api simplicity)
      this.recipeService.getRecipes().subscribe(allRecipes => {
        this.favoriteRecipes = allRecipes.filter(r => !!this.userFavorites[r.id]);
        this.loading = false;
      });
    });
  }

  onToggleFavorite(recipe: Recipe) {
    if (!this.currentUserId) return;
    
    const favId = this.userFavorites[recipe.id];
    if (favId) {
      this.favoriteService.removeFavorite(favId).subscribe(() => {
        delete this.userFavorites[recipe.id];
        // Remove from UI array
        this.favoriteRecipes = this.favoriteRecipes.filter(r => r.id !== recipe.id);
      });
    }
  }
}
