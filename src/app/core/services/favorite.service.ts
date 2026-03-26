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
  private apiUrl = `${environment.apiUrl}/favorites`;

  constructor(private http: HttpClient) {}

  getUserFavorites(userId: string): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.apiUrl}?userId=${userId}`);
  }

  addFavorite(userId: string, recipeId: string): Observable<Favorite> {
    const newFavorite = { id: String(Date.now()), userId, recipeId };
    return this.http.post<Favorite>(this.apiUrl, newFavorite);
  }

  removeFavorite(favoriteId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${favoriteId}`);
  }
}
