import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Recipe } from '../../core/services/recipe.service';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card recipe-card h-100 position-relative">
      <div class="position-absolute top-0 end-0 p-2 z-1">
        <button class="btn btn-light rounded-circle shadow-sm" style="width: 40px; height: 40px; border: none; z-index: 10;" (click)="onToggleFavorite($event)">
          <i class="bi" [ngClass]="isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart'"></i>
        </button>
      </div>
      
      <img [src]="recipe.imageUrl" class="card-img-top" [alt]="recipe.title">
      
      <div class="card-body d-flex flex-column" [routerLink]="['/recipes', recipe.id]" style="cursor: pointer;">
        <span class="badge bg-secondary mb-2 align-self-start" style="background-color: var(--accent-color) !important;">{{ recipe.category }}</span>
        <h5 class="card-title brand-font text-truncate" [title]="recipe.title">{{ recipe.title }}</h5>
        
        <div class="d-flex align-items-center mt-auto pt-3">
          <i class="bi bi-star-fill text-warning me-1"></i>
          <span class="fw-bold">{{ recipe.rating | number:'1.1-1' }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recipe-card:hover .card-title {
      color: var(--accent-color);
    }
  `]
})
export class RecipeCardComponent {
  @Input() recipe!: Recipe;
  @Input() isFavorite = false;
  @Output() favoriteToggle = new EventEmitter<Recipe>();

  onToggleFavorite(event: Event) {
    event.stopPropagation();
    this.favoriteToggle.emit(this.recipe);
  }
}
