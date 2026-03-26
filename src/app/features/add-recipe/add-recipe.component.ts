import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecipeService } from '../../core/services/recipe.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-add-recipe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-5 pt-3 mb-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="text-center mb-5">
            <h1 class="display-5 font-outfit">Share Your Recipe</h1>
            <p class="text-muted">Fill out the details below to add your culinary creation to our community.</p>
          </div>

          <div class="card recipe-card p-4 p-md-5 border-0 shadow-sm rounded-4">
            <form [formGroup]="recipeForm" (ngSubmit)="onSubmit()">
              
              <div class="mb-4">
                <label class="form-label fw-bold">Recipe Title</label>
                <input type="text" class="form-control form-control-lg bg-light" formControlName="title" placeholder="e.g. Grandma's Apple Pie"
                       [ngClass]="{'border-danger': isInvalid('title')}">
                <div class="text-danger small mt-1" *ngIf="isInvalid('title')">Title is required.</div>
              </div>

              <div class="row mb-4">
                <div class="col-md-6 mb-3 mb-md-0">
                  <label class="form-label fw-bold">Category</label>
                  <select class="form-select bg-light" formControlName="category" [ngClass]="{'border-danger': isInvalid('category')}">
                    <option value="" disabled>Select a category</option>
                    <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                  </select>
                  <div class="text-danger small mt-1" *ngIf="isInvalid('category')">Category is required.</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Image URL</label>
                  <input type="text" class="form-control bg-light" formControlName="imageUrl" placeholder="https://example.com/image.jpg"
                         [ngClass]="{'border-danger': isInvalid('imageUrl')}">
                  <div class="text-danger small mt-1" *ngIf="isInvalid('imageUrl')">A valid image URL is required.</div>
                </div>
              </div>

              <div class="mb-5">
                <label class="form-label fw-bold">Short Description</label>
                <textarea class="form-control bg-light" rows="2" formControlName="description" placeholder="What makes this special?"
                          [ngClass]="{'border-danger': isInvalid('description')}"></textarea>
                <div class="text-danger small mt-1" *ngIf="isInvalid('description')">Description is required.</div>
              </div>

              <!-- Ingredients Array -->
              <div class="mb-5" formArrayName="ingredients">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h4 class="font-outfit mb-0">Ingredients</h4>
                  <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="addIngredient()">
                    <i class="bi bi-plus"></i> Add Item
                  </button>
                </div>
                
                <div class="row mb-2" *ngFor="let item of ingredients.controls; let i=index" [formGroupName]="i">
                  <div class="col-10 col-md-11">
                    <input type="text" class="form-control bg-light" formControlName="name" placeholder="e.g. 2 cups flour">
                  </div>
                  <div class="col-2 col-md-1 text-end">
                    <button type="button" class="btn btn-outline-danger border-0" (click)="removeIngredient(i)" *ngIf="ingredients.length > 1">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Steps Array -->
              <div class="mb-5" formArrayName="steps">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h4 class="font-outfit mb-0">Instructions</h4>
                  <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="addStep()">
                    <i class="bi bi-plus"></i> Add Step
                  </button>
                </div>
                
                <div class="mb-3 d-flex" *ngFor="let step of steps.controls; let i=index" [formGroupName]="i">
                  <div class="me-3 fw-bold fs-5 text-muted pt-1">{{ i + 1 }}.</div>
                  <div class="flex-grow-1 position-relative">
                    <textarea class="form-control bg-light" rows="2" formControlName="instruction" placeholder="Describe this step..."></textarea>
                    <button type="button" class="btn btn-sm btn-outline-danger border-0 position-absolute top-0 end-0 mt-1 me-1" 
                            (click)="removeStep(i)" *ngIf="steps.length > 1" title="Remove step">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <hr class="mb-4">

              <div class="text-end">
                <button type="button" class="btn btn-light me-3 px-4" (click)="goBack()">Cancel</button>
                <button type="submit" class="btn btn-primary px-5 btn-lg" [disabled]="loading">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Publish Recipe
                </button>
              </div>

              <div *ngIf="error" class="alert alert-danger mt-3">{{ error }}</div>
              
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AddRecipeComponent implements OnInit {
  recipeForm!: FormGroup;
  loading = false;
  error = '';
  categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegan', 'Vegetarian', 'Snack', 'Drink'];

  constructor(
    private formBuilder: FormBuilder,
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.currentUserValue) {
      alert('You must be logged in to share a recipe.');
      this.router.navigate(['/login']);
      return;
    }

    this.recipeForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.*')]],
      ingredients: this.formBuilder.array([ this.createIngredientGroup() ]),
      steps: this.formBuilder.array([ this.createStepGroup() ])
    });
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps() {
    return this.recipeForm.get('steps') as FormArray;
  }

  createIngredientGroup() {
    return this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  createStepGroup() {
    return this.formBuilder.group({
      instruction: ['', Validators.required]
    });
  }

  addIngredient() {
    this.ingredients.push(this.createIngredientGroup());
  }

  removeIngredient(index: number) {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  addStep() {
    this.steps.push(this.createStepGroup());
  }

  removeStep(index: number) {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  isInvalid(controlName: string) {
    const control = this.recipeForm.get(controlName);
    return control?.invalid && control?.touched;
  }

  goBack() {
    this.router.navigate(['/recipes']);
  }

  onSubmit() {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const formVal = this.recipeForm.value;
    const currentUser = this.authService.currentUserValue;
    
    // Map form arrays to simple string arrays and attach ownership properties
    const formattedRecipe = {
      ...formVal,
      ingredients: formVal.ingredients.map((i: any) => i.name).filter((n: string) => n.trim() !== ''),
      steps: formVal.steps.map((s: any) => s.instruction).filter((i: string) => i.trim() !== ''),
      userId: currentUser?.id,
      createdAt: new Date().toISOString()
    };

    this.recipeService.createRecipe(formattedRecipe).subscribe({
      next: (recipe) => {
        this.router.navigate(['/profile']); // Go to profile immediately to see My Recipes
      },
      error: () => {
        this.error = 'Failed to create recipe. Please try again.';
        this.loading = false;
      }
    });
  }
}
