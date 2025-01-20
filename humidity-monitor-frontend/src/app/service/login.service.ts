import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.apiUrl;  // Base URL of the FastAPI server
  //use environment url
  private loginUrl = `${this.apiUrl}/auth/login`;  // FastAPI login endpoint
  // private loginUrl = 'http://192.168.0.84:9001/auth/login';  // FastAPI login endpoint

  constructor(private http: HttpClient) { }

  saveCustomer(username: string, password: string): Observable<any> {
    // send json paylod
    return this.http.post(this.loginUrl, {"username": username, "password": password});  // Use POST method, returns a JWT token
  }

 
}



