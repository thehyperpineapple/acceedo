import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

export interface ServerData {
  unit_ID: number;
  // Add other fields if needed...
}

@Injectable({
  providedIn: 'root'
})
export class DashService {
  private apiUrl = environment.apiUrl; // Updated API URL

  constructor(private http: HttpClient) {}

  getUnitIDs(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/external/getUnitCount`);
}

  // Method to get server by ID
  getServer(unit_ID: number): Observable<ServerData> {
    return this.http.get<ServerData>(`${this.apiUrl}/report/${unit_ID}`);
  }

  // Method to create a new server
  createServer(unit_ID: number): Observable<ServerData> {
    return this.http.post<ServerData>(`${this.apiUrl}/external/createServer`, {"unit_ID": unit_ID}); //update backend 
  }

 
}
