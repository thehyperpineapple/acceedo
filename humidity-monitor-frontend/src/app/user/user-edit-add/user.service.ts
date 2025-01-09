import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://192.168.0.84:9001/api/v1/users'; // Base URL for the JSON server

  constructor(private http: HttpClient) { }

  // Add a new user
  addUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, user);
}

  // Get the list of users
  getUserList(): Observable<any> {
    return this.http.get(this.baseUrl); // Send GET request to fetch all users
  }

// Delete a user by UserID
delUser(user_ID: string): Observable<any> {
  const url = `${this.baseUrl}/delete/${user_ID}`; // Corrected URL syntax to match API
  return this.http.delete(url); // Send DELETE request to delete user
}

editUser(user_ID: string, data: any): Observable<any> {
  const url = `${this.baseUrl}/update/${user_ID}`; // Ensure this URL is correct
  return this.http.put(url, data); // Send PUT request with user data
}
}

