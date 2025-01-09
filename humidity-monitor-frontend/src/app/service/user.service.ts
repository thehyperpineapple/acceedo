import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private _http: HttpClient) { }

  // Change the method to use GET and pass data as query parameters
  addUser(data: any): Observable<any> {
    // Construct the query parameters from the form data
    const queryParams = `?userId=${data.userId}&userName=${data.userName}&role=${data.role}&name=${data.name}&email=${data.email}&phone=${data.phone}&password=${data.password}`;
    
    // Append the query parameters to the API endpoint URL
    const url = `http://your-api-endpoint.com/api${queryParams}`;
    
    return this._http.get(url);  // Use GET request
  }

  getUserList():Observable<any>{
    const url = 'http://192.168.0.84:9001/api/v1/users/{userId}';
    return this._http.get(url);
  }

  delUser(UserID:string):Observable<any>{
    return this._http.delete('url${UserID}');
  }

  editUser(UserID:string, data:any):Observable<any>{
    return this._http.put(`url/${UserID}`, data);
  }

}
