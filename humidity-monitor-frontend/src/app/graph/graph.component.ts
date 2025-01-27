import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  fill: boolean;
}
@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
})
export class GraphComponent implements OnInit, OnDestroy {
  isBrowser: boolean = false;
  baseUrl = environment.apiUrl;
  wsUrl = environment.wsUrl;

  public boards: number[] = [];
  private webSocketConnections: { [key: number]: WebSocket } = {};
  public temperatureChart: Chart | null = null;
  public humidityChart: Chart | null = null;
  public powerChart: Chart | null = null;
  public waterLevelChart: Chart | null = null;
  public port: number = 8000;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.fetchBoardIDs();
      this.initializeCharts();
    }
  }

  ngOnDestroy() {
    // Clean up WebSocket connections
    Object.values(this.webSocketConnections).forEach((ws) => ws.close());
  }

  private fetchBoardIDs(): void {
    this.http
      .get<{ unitIDs: number[] }>(`${this.baseUrl}/external/getUnitCount`)
      .subscribe(
        (response) => {
          this.boards = response.unitIDs;
          if (this.boards && this.boards.length > 0) {
            this.setupWebSocketConnections();
          } else {
            console.warn('No boards available for WebSocket connections.');
          }
        },
        (error) => {
          console.error('Error fetching board IDs:', error);
        }
      );
  }

  private setupWebSocketConnections(): void {
    this.boards.forEach((boardID) => {
      const ws = new WebSocket(`${this.wsUrl}:${this.port + boardID}`);
      this.webSocketConnections[boardID] = ws;

      ws.onmessage = (event) => {
        // console.log(`Raw WebSocket message from Board ${boardID}:`, event.data);
        const data = JSON.parse(event.data);
        // console.log(`Data received from Board ${boardID}:`, data);
        this.updateCharts(boardID, data);
      };

      ws.onclose = () => {
        console.log(`WebSocket connection for Board ${boardID} closed.`);
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for Board ${boardID}:`, error);
      };
    });
  }

  private initializeCharts(): void {
    this.temperatureChart = this.createChart(
      'temperatureCanvas',
      'Temperature',
      '°C'
    );
    this.humidityChart = this.createChart(
      'humidityCanvas',
      'Humidity',
      '%'
    );
    this.powerChart = this.createChart(
      'powerCanvas',
      'Power',
      'W'
    );
    this.waterLevelChart = this.createChart(
      'waterLevelCanvas',
      'Water Level',
      'L'
    );
  }

  private createChart(
    canvasId: string,
    label: string,
    unit: string
  ): Chart {
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: [], // Time points
        datasets: [],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${context.raw} ${unit}`,
            },
          },
        },
        scales: {
          x: { title: { display: true, text: 'Time' } },
          y: { title: { display: true, text: `${label} (${unit})` } },
        },
      },
    });
  }

  private updateCharts(boardID: number, response: any): void {
    // console.log(`Updating charts for Board ${boardID}:`, response);
  
    // Ensure the data property exists
    if (!response || !response.data) {
      console.warn(`No valid data property received for Board ${boardID}:`, response);
      return;
    }
  
    const data = response.data; // Access the actual data object
    console.log(`Data object for Board ${boardID}:`, data);
  
    const timestamp = new Date(data.timestamp || Date.now()).toLocaleTimeString();
  
    // Update Temperature Chart
    if (this.temperatureChart && data.t !== undefined) {
      // console.log(`Updating Temperature Chart: Board ${boardID}, Value: ${data.t}`);
      this.addDataToChart(this.temperatureChart, boardID, timestamp, data.t);
    }
  
    // Update Humidity Chart
    if (this.humidityChart && data.h !== undefined) {
      // console.log(`Updating Humidity Chart: Board ${boardID}, Value: ${data.h}`);
      this.addDataToChart(this.humidityChart, boardID, timestamp, data.h);
    }
  
    // Update Power Chart
    if (this.powerChart && data.eb !== undefined) {
      // console.log(`Updating Power Chart: Board ${boardID}, Value: ${data.eb}`);
      this.addDataToChart(this.powerChart, boardID, timestamp, data.eb);
    }
  
    // Update Water Level Chart
    if (this.waterLevelChart && data.w !== undefined) {
      // console.log(`Updating Water Level Chart: Board ${boardID}, Value: ${data.w}`);
      this.addDataToChart(this.waterLevelChart, boardID, timestamp, data.w);
    }
  }
  

  private addDataToChart(
    chart: Chart,
    boardID: number,
    timestamp: string,
    value: number
): void {
    if (!chart?.data?.datasets) {
        console.error('Invalid chart structure');
        return;
    }

    const numericalValue = Number(value);
    if (isNaN(numericalValue)) {
        console.error(`Invalid value for Board ${boardID}: ${value}`);
        return;
    }

    let dataset = chart.data.datasets.find(
        (ds) => ds.label === `Board ${boardID}`
    ) as ChartDataset | undefined;

    if (!dataset) {
        dataset = {
            label: `Board ${boardID}`,
            data: [],
            borderColor: this.getRandomColor(),
            fill: false,
        };
        chart.data.datasets.push(dataset);
    }

    if (!Array.isArray(dataset.data)) {
        dataset.data = [];
    }

    dataset.data.push(numericalValue);

    if (!Array.isArray(chart.data.labels)) {
        chart.data.labels = [];
    }

    if (!chart.data.labels.includes(timestamp)) {
        chart.data.labels.push(timestamp);
    }

    // Limit data points
    if (dataset.data.length > 50) {
        dataset.data.shift();
    }
    if (chart.data.labels.length > 50) {
        chart.data.labels.shift();
    }

    chart.update();
} 

  private getRandomColor(): string {
    return `hsl(${Math.random() * 360}, 70%, 50%)`;
  }

  isSidebarOpen = false;

  toggleSidebar() {
    console.log('Sidebar toggled');
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
