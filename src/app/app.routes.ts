import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { RecipesComponent } from './features/recipes/recipes.component';
import { RecipeDetailsComponent } from './features/recipe-details/recipe-details.component';
import { AddRecipeComponent } from './features/add-recipe/add-recipe.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { FavoritesComponent } from './features/favorites/favorites.component';
import { EditRecipeComponent } from './features/edit-recipe/edit-recipe.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'recipes', component: RecipesComponent },
  { path: 'recipes/:id', component: RecipeDetailsComponent },
  { path: 'add-recipe', component: AddRecipeComponent },
  { path: 'edit-recipe/:id', component: EditRecipeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: '**', redirectTo: '' }
];
