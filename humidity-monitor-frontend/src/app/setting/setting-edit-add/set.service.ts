import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerResponse } from '../setting.model'; // Ensure this path is correct

@Injectable({
  providedIn: 'root'
})
export class SetService {
  private baseUrl = 'http://192.168.0.84:9001/api/v1/settings'; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  // Get the list of servers
  getUserList(): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(`${this.baseUrl}`); // Use the correct endpoint for fetching servers
  }

 // User service to add server
addUser(userData: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/add_server`, userData);  // Make sure the URL is correct
}

  // Edit an existing server
  editUser(unit_ID: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update_server/${unit_ID}`, userData);
  }

  // Delete a server
  delUser(unit_ID: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete_server/${unit_ID}`);
  }
}



