import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PublicLayoutComponent } from './public-layout.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { AboutComponent } from './about/about.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { ContactComponent } from './contact/contact.component';
import { AdminLayoutComponent } from './admin/admin-layout.component';
import { AdminUploadComponent } from './admin/upload/admin-upload.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Authentication Route
  {
    path: 'login',
    component: LoginComponent
  },
  
  // Public Client Routes
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'reviews', component: ReviewsComponent },
      { path: 'contact', component: ContactComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  // Private Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'upload', component: AdminUploadComponent },
      { path: '', redirectTo: 'upload', pathMatch: 'full' }
    ]
  },

  // Wildcard Fallback
  {
    path: '**',
    redirectTo: 'home'
  }
];
