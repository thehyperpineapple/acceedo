import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = 'http://192.168.0.84:9001/api/v1';  // FastAPI server address
  private socketUrl = 'ws://192.168.0.84:9001/ws/graphdata';  // WebSocket URL

  constructor(private http: HttpClient) {}

  getChartDataByUnitID(unit_ID: number, startTime: Date, endTime: Date): Observable<any> {
    const formattedStartTime = startTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const formattedEndTime = endTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const url = `${this.baseUrl}/graphdata/${unit_ID}?start_time=${formattedStartTime}&end_time=${formattedEndTime}`;
    
    return this.http.get(url);
  }

  // New method to get live data using WebSocket
  getLiveData(unit_ID: number): Subject<any> {
    const subject = new Subject<any>();
    const ws = new WebSocket(`${this.socketUrl}/${unit_ID}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      subject.next(message.data);  // Emit data to subscribers
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      subject.error(error);
    };

    ws.onclose = () => {
      console.log(`WebSocket connection for Unit ID ${unit_ID} closed`);
      subject.complete();
    };

    return subject;  // Return the Subject that emits data from WebSocket
  }
}
