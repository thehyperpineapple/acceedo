import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/v1/logout'; // Adjust this to your actual API endpoint

  constructor(private http: HttpClient, private router: Router) {}

  logout() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.http
        .post(this.apiUrl, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .subscribe(
          (response) => {
            // Clear token from local storage on successful logout
            localStorage.removeItem('access_token');
            // Redirect the user to the login page
            this.router.navigate(['/login']);
          },
          (error) => {
            console.error('Logout failed: ', error);
          }
        );
    } else {
      console.error('No token found');
      this.router.navigate(['/login']); // Redirect to login even if token is not found
    }
  }
}
