import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  category: string;
  imageUrl: string;
  rating: number;
  userId?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private apiUrl = `${environment.apiUrl}/recipes.json`;

  constructor(private http: HttpClient) {}

  getRecipes(category?: string, search?: string): Observable<Recipe[]> {
    return this.http.get<Record<string, Recipe>>(this.apiUrl).pipe(
      map(data => {
        if (!data) return [];
        let recipes = Object.values(data);
        
        if (category && category !== 'All') {
          recipes = recipes.filter(r => r.category === category);
        }
        
        if (!search || search.trim() === '') return recipes;
        const lowerSearch = search.toLowerCase().trim();
        return recipes.filter(r => 
          r.title.toLowerCase().includes(lowerSearch) ||
          r.description.toLowerCase().includes(lowerSearch) ||
          (r.ingredients && r.ingredients.some(i => i.toLowerCase().includes(lowerSearch)))
        );
      })
    );
  }

  getRecipe(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${environment.apiUrl}/recipes/${id}.json`);
  }

  getRecipesByUserId(userId: string): Observable<Recipe[]> {
    return this.http.get<Record<string, Recipe>>(this.apiUrl).pipe(
      map(data => {
        if (!data) return [];
        return Object.values(data).filter(r => r.userId === userId);
      })
    );
  }

  createRecipe(recipe: Partial<Recipe>): Observable<Recipe> {
    const newRecipe = {
      ...recipe,
      id: recipe.id || Math.random().toString(36).substring(2, 11),
      rating: recipe.rating || 0,
      createdAt: recipe.createdAt || new Date().toISOString()
    } as Recipe;
    return this.http.put<Recipe>(`${environment.apiUrl}/recipes/${newRecipe.id}.json`, newRecipe);
  }

  updateRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(`${environment.apiUrl}/recipes/${recipe.id}.json`, recipe);
  }

  deleteRecipe(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/recipes/${id}.json`);
  }
}
