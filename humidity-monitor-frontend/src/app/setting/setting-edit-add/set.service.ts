import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerResponse } from '../setting.model'; // Ensure this path is correct
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SetService {
  private apiUrl = environment.apiUrl;  // Base URL of the FastAPI server
  private baseUrl = `${this.apiUrl}/settings`; // Update with your actual API URL

  constructor(private http: HttpClient) {}

  // Get the list of servers
  getUserList(): Observable<ServerResponse> {
    return this.http.get<ServerResponse>(`${this.baseUrl}/getSettings/`); // Use the correct endpoint for fetching servers
  }

 // User service to add server
addUser(userData: any): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/addSettings`, userData);  // Make sure the URL is correct
}

  // Edit an existing server
  editUser(unit_ID: number, userData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/addSettings`, userData);
  }

  // Delete a server
  delUser(unit_ID: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteSetting?unit_ID=${unit_ID}`);
  }
}



