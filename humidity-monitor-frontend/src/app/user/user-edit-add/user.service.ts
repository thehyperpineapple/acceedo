import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;  // Base URL of the FastAPI server
  private baseUrl = `${this.apiUrl}/auth`; // Base URL for the JSON server

  constructor(private http: HttpClient) { }

  // Add a new user
  addUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/createUser`, user);
}

  // Get the list of users
  getUserList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/viewUsers`); // Send GET request to fetch all users
  }

// Delete a user by UserID
delUser(user_ID: string): Observable<any> {
  const url = `${this.baseUrl}/deleteUser?user_ID=${user_ID}`; // Corrected URL syntax to match API
  return this.http.delete(url); // Send DELETE request to delete user
}

editUser(user_ID: string, data: any): Observable<any> {
  const url = `${this.baseUrl}/updateUser/${user_ID}`; // Ensure this URL is correct
  return this.http.put(url, data); // Send PUT request with user data
}
}

