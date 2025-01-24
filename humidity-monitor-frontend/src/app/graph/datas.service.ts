import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../environment/environment';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = environment.apiUrl;  // FastAPI server address
  private socketUrl = `ws://${this.baseUrl}/ws/graphdata`;  // WebSocket URL

  constructor(private http: HttpClient) {}

  private units = `${this.baseUrl}/external/getUnitCount`;
  
  getChartDataByUnitID(units: number, startTime: Date, endTime: Date): Observable<any> {
    const formattedStartTime = startTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const formattedEndTime = endTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const url = `${this.baseUrl}/graphdata/${units}?start_time=${formattedStartTime}&end_time=${formattedEndTime}`;
    
    return this.http.get(url);
  }
  
  getBoardIDs(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/external/getBoardIDs`);
  }

  // New method to get live data using WebSocket
  getLiveData(units: number): Subject<any> {
    const subject = new Subject<any>();
    const ws = new WebSocket(`${this.socketUrl}/${units}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      subject.next(message.data);  // Emit data to subscribers
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      subject.error(error);
    };

    ws.onclose = () => {
      console.log(`WebSocket connection for Unit ID ${units} closed`);
      subject.complete();
    };

    return subject;  // Return the Subject that emits data from WebSocket
  }
}
