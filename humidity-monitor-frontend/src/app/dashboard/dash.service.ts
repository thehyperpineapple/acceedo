import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServerData {
  unit_ID: number;
  // Add other fields if needed...
}

@Injectable({
  providedIn: 'root'
})
export class DashService {
  private apiUrl = `http://192.168.0.84:9001/api/v1`; // Updated API URL

  constructor(private http: HttpClient) {}

  getUnitIDs(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/unitIDs`);
}

  // Method to get server by ID
  getServer(unit_ID: number): Observable<ServerData> {
    return this.http.get<ServerData>(`${this.apiUrl}/dashboard/${unit_ID}`);
  }

  // Method to create a new server
  createServer(unit_ID: number): Observable<ServerData> {
    return this.http.get<ServerData>(`${this.apiUrl}/dashboard/create/${unit_ID}`);
  }

 
}
