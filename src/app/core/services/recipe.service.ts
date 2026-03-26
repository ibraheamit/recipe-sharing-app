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
  private apiUrl = `${environment.apiUrl}/recipes`;

  constructor(private http: HttpClient) {}

  getRecipes(category?: string, search?: string): Observable<Recipe[]> {
    let params = new HttpParams();
    if (category && category !== 'All') params = params.set('category', category);

    return this.http.get<Recipe[]>(this.apiUrl, { params }).pipe(
      map((recipes: Recipe[]) => {
        if (!search || search.trim() === '') return recipes;
        const lowerSearch = search.toLowerCase().trim();
        return recipes.filter((r: Recipe) => 
          r.title.toLowerCase().includes(lowerSearch) ||
          r.description.toLowerCase().includes(lowerSearch) ||
          r.ingredients.some((i: string) => i.toLowerCase().includes(lowerSearch))
        );
      })
    );
  }

  getRecipe(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  getRecipesByUserId(userId: string): Observable<Recipe[]> {
    let params = new HttpParams().set('userId', userId);
    return this.http.get<Recipe[]>(this.apiUrl, { params });
  }

  createRecipe(recipe: Partial<Recipe>): Observable<Recipe> {
    // Generate a simple ID if not provided by backend (json-server usually does this though, but just in case)
    const newRecipe = {
      ...recipe,
      id: recipe.id || Math.random().toString(36).substring(2, 11), // Use existing ID or generate one
      rating: recipe.rating || 0, // Use existing rating or default to 0
      createdAt: recipe.createdAt || new Date().toISOString() // Use existing createdAt or set current time
    };
    return this.http.post<Recipe>(this.apiUrl, newRecipe);
  }

  updateRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${recipe.id}`, recipe);
  }

  deleteRecipe(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
