import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout.component';
import { HomeComponent } from './dashboard/home/home.component';
import { ProductsComponent } from './dashboard/products/products.component';
import { AboutComponent } from './dashboard/about/about.component';
import { ReviewsComponent } from './dashboard/reviews/reviews.component';
import { ContactComponent } from './dashboard/contact/contact.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'products',
        component: ProductsComponent
      },
      {
        path: 'about',
        component: AboutComponent
      },
      {
        path: 'reviews',
        component: ReviewsComponent
      },
      {
        path: 'contact',
        component: ContactComponent
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
