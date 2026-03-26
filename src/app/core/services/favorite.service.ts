import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Recipe } from './recipe.service';
import { environment } from '../../../environments/environment';

export interface Favorite {
  id: string;
  userId: string;
  recipeId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorites.json`;

  constructor(private http: HttpClient) {}

  getUserFavorites(userId: string): Observable<Favorite[]> {
    return this.http.get<Record<string, Favorite>>(this.apiUrl).pipe(
      map(data => {
        if (!data) return [];
        return Object.values(data).filter(f => f.userId === userId);
      })
    );
  }

  addFavorite(userId: string, recipeId: string): Observable<Favorite> {
    const newFavorite = { id: String(Date.now()), userId, recipeId };
    return this.http.put<Favorite>(`${environment.apiUrl}/favorites/${newFavorite.id}.json`, newFavorite);
  }

  removeFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/favorites/${favoriteId}.json`);
  }
}
