import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-dark text-light py-4 mt-auto">
      <div class="container text-center">
        <div class="mb-3">
          <i class="bi bi-egg-fried text-accent fs-3 me-2" style="color: var(--accent-color)"></i>
          <span class="brand-font fs-4">RecipeShare</span>
        </div>
        <p class="text-muted mb-0">© 2026 RecipeShare. All rights reserved.</p>
        <p class="text-muted small">Discover, share, and save your favorite recipes.</p>
        <div class="mt-3">
          <a href="#" class="text-light me-3"><i class="bi bi-facebook fs-5"></i></a>
          <a href="#" class="text-light me-3"><i class="bi bi-twitter-x fs-5"></i></a>
          <a href="#" class="text-light"><i class="bi bi-instagram fs-5"></i></a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
