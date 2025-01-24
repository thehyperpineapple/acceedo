
import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DashService } from './dash.service';
import { SharreService } from '../summma/sharre.service';
import { Chart, registerables } from 'chart.js';
import { environment } from '../environment/environment';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('linechart', { static: false }) linechart!: ElementRef; // ViewChild for chart canvas
  servers: any[] = []; 
  unitIDs: number[] = []; 
  selectedUnitID: number | null = null; // Declare selectedUnitID
  private socket$: WebSocketSubject<any> | null = null;
  private socketSubscription: Subscription | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  Linecharts: { [unitID: number]: Chart } = {}; // Store multiple chart instances
  isSidebarOpen = true;
  private platformId: Object; // Declare platformId
  private apiUrl = environment.apiUrl; // Assign server address

  constructor(
    private http: HttpClient,
    private share: SharreService,
    private dashService: DashService, 
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object // Inject PLATFORM_ID
  ) {
    this.platformId = platformId; // Assign injected platformId
  }

  ngOnInit(): void {
    this.getUnitIDs();  
    this.setupBroadcastChannel();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges(); // Ensure the DOM is rendered
    // Only set up charts in the browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.servers.forEach(server => {
        this.setupChart(server.unit_ID); // Setup chart for each server
      });
    }
  }
  
  ngOnDestroy(): void {
    this.disconnectWebSocket();  
    this.broadcastChannel?.close(); 
  }

  private connectWebSocket(retry: boolean = true) {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('WebSocket connections are only available in the browser environment.');
      return;
    }

    console.log('Attempting to connect to WebSocket...');

    this.socket$ = new WebSocketSubject({
      url: `ws://${this.apiUrl}/ws`,
      openObserver: {
        next: () => {
          console.log('WebSocket connection opened.');
          this.unitIDs.forEach(unit_ID => {
            if (this.socket$) {
              console.log(`Sending unit_ID to server: ${unit_ID}`);
              this.socket$.next({ unit_ID: unit_ID });
            }
          });
          this.reconnectAttempts = 0; 
        }
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket connection closed.');
          this.socket$ = null;
          if (retry && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connectWebSocket(), 3000);
          }
        }
      }
    });

    this.socketSubscription = this.socket$.subscribe(
      (message) => {
        console.log('Message from server:', message); 
        this.handleMessage(message);
      },
      (err) => this.handleError(err),
      () => this.handleCompletion() 
    );
  }

  private handleMessage(message: any) {
    console.log('Message from server:', message); // Log the incoming message
  
    const index = this.servers.findIndex(server => server.unit_ID === message.unit_ID);
  
    if (index > -1) {
      this.servers[index] = message; // Update existing server data
      console.log(`Updated server data for unit_ID ${message.unit_ID}:`, this.servers[index]);
      this.updateChart(message.unit_ID, message.t, message.h); // Ensure t and h are passed
    } else {
      this.servers.push(message); // Add new server
      console.log(`Added new server:`, message);
      this.cdr.detectChanges();
  
      // Only set up charts for new servers in the browser environment
      if (isPlatformBrowser(this.platformId)) {
        this.setupChart(message.unit_ID); // Setup the chart for the new server
      }
    }
  }
  

  private handleError(error: any) {
    console.error('WebSocket error:', error);
  }

  private handleCompletion() {
    console.log('WebSocket connection completed.');
    console.log();
  }

  private setupBroadcastChannel() {
    if (isPlatformBrowser(this.platformId)) {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('humidity_channel');
        this.broadcastChannel.onmessage = (event) => {
          console.log('Message received from broadcast channel:', event.data);
        };
      } else {
        console.warn('BroadcastChannel is not supported by your browser.');
      }
    } else {
      console.warn('BroadcastChannel is only available in the browser environment.');
    }
  }

  private setupChart(unit_ID: number) {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Charts can only be initialized in the browser environment.');
      return;
    }
  
    const canvasId = `linechart-${unit_ID}`;
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  
    if (!canvas) {
      console.error(`Canvas element with ID ${canvasId} not found`);
      return;
    }
  
    // Create a new chart instance
    this.Linecharts[unit_ID] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [
          {
            label: 'Humidity',
            data: [], // Initially empty
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Temperature',
            data: [], // Initially empty
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Time (10 AM - 10 PM)'
            }
          },
          y: {
            type: 'linear',
            beginAtZero: true,
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Value Range (0 - 100)'
            }
          }
        }
      }
    });
    console.log(`Chart initialized for server: ${unit_ID}`);
  }
  

  private updateChart(unit_ID: number, t: number, h: number) {
  if (this.Linecharts[unit_ID]) {
    // Update the chart data
    this.Linecharts[unit_ID].data.datasets[0].data.push(h);
    this.Linecharts[unit_ID].data.datasets[1].data.push(t);

    // Maintain a maximum of 7 data points
    if (this.Linecharts[unit_ID].data.datasets[0].data.length > 7) {
      this.Linecharts[unit_ID].data.datasets[0].data.shift();
    }
    if (this.Linecharts[unit_ID].data.datasets[1].data.length > 7) {
      this.Linecharts[unit_ID].data.datasets[1].data.shift();
    }

    console.log(`Updated chart for unit_ID ${unit_ID}:`, this.Linecharts[unit_ID].data.datasets); // Log the updated datasets

    this.Linecharts[unit_ID].update();
  } else {
    console.error(`Chart instance for unitID ${unit_ID} not found.`);
  }
}

  
  private getUnitIDs() {
    this.dashService.getUnitIDs().subscribe(
      (unitIDs: number[]) => {
        this.unitIDs = unitIDs;
        this.connectWebSocket();
      },
      (error) => {
        console.error('Error fetching unit IDs:', error);
      }
    );
  }



  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  private disconnectWebSocket() {
    if (this.socket$) {
      this.socket$.complete(); 
      this.socket$ = null; 
    }
  }
}