import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { isPlatformBrowser } from '@angular/common';
import { GoogleChartInterface } from 'ng2-google-charts';
import { ReportOptionsComponent } from './report-options/report-options.component';
import { Chart } from 'chart.js/auto';

interface DataEntry {
  _id: string;
  unit_ID: number;
  t: number;
  h: number;
  w: number;
  eb: number;
  ups: number;
  x: number;
  y: number;
  timestamp: string;
}

interface DataResponse {
  data: DataEntry[];
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit, AfterViewInit {
  private baseUrl = environment.apiUrl;
  unitId!: number;
  selectedDate: Date = new Date();
  displayedColumns: string[] = ['time', 'temperature', 'humidity'];
  dataSource = new MatTableDataSource<DataEntry>([]);
  boardIDs: number[] = [];
  isSidebarOpen = false;
  public lineChart2!: GoogleChartInterface;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Chart Variables
  public chart: any;
  public chartTemperatureData: number[] = [];
  public chartHumidityData: number[] = [];
  public chartLabels: string[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dialog: MatDialog
  ) {}

  getBoardIDs(): Observable<{ unitIDs: number[] }> {
    return this.http.get<{ unitIDs: number[] }>(`${this.baseUrl}/external/getUnitCount`);
  }

  getDataByUnitIdAndDate(unitId: number, date: Date): Observable<DataResponse> {
    let nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const formattedStartDate = nextDate.toISOString().split('T')[0]; // Format start date as YYYY-MM-DD

    nextDate.setDate(nextDate.getDate() + 1);
    const formattedEndDate = nextDate.toISOString().split('T')[0]; // Format end date as YYYY-MM-DD
    return this.http.get<DataResponse>(`${this.baseUrl}/report/${unitId}?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
  }

  ngOnInit() {
    this.fetchBoardIDs();
    if (isPlatformBrowser(this.platformId)) {
      this.initializeChart();
    }
    this.route.params.subscribe(params => {
      this.unitId = +params['unit_Id'];
      if (this.unitId && this.selectedDate) {
        this.fetchData();
      }
    
    });

    // if (isPlatformBrowser(this.platformId)) {
    //   this.initializeChart();
    // }
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  fetchBoardIDs() {
    this.getBoardIDs().subscribe((response: { unitIDs: number[] }) => {
      this.boardIDs = response.unitIDs;
    });
  }

  fetchData(): void {
    if (this.unitId && this.selectedDate) {
      this.getDataByUnitIdAndDate(this.unitId, this.selectedDate).subscribe({
        next: (response) => {
          const data = response.data.map((entry: DataEntry) => ({
            ...entry,
            time: new Date(entry.timestamp).toLocaleString()
          }));
          this.dataSource.data = data;
          console.log(data);

          // Extract relevant data for the chart
          const chartLabels = data.map(item => item.time);
          const chartTemperatureData = data.map(item => item.t);
          const chartHumidityData = data.map(item => item.h);

          // Update chart with new data
          this.chart.data.labels = chartLabels;
          this.chart.data.datasets[0].data = chartTemperatureData;
          this.chart.data.datasets[1].data = chartHumidityData;
          this.chart.update();

          this.initializeChart();
        },
        error: (err) => {
          if (err.status === 404) {
            this.dataSource.data = [];
          }
          this.handleError('Failed to fetch data', err);
        }
      });
    }
  }
  handleError(message: string, err: any): void {
    console.error(message, err);
    alert(message);
  }

  onBoardChange(event: any) {
    this.unitId = event.value;
    // location.reload();
    this.fetchData();
  }

  onDateChange(event: any) {
    this.selectedDate = event.value;
    // location.reload();
    this.fetchData();
  }

  toggleSidebar() {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Sidebar toggled');
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openReportOptions(data?: any) {
    const dialogRef = this.dialog.open(ReportOptionsComponent, {
      data
    });
  
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.fetchData(); // Refresh data after dialog closes
        }
      }
    });
  }
  initializeChart(): void {
    const canvas = document.getElementById('lineChart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartLabels,
          datasets: [
            {
              label: 'Temperature (T)',
              data: this.chartTemperatureData,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Humidity (H)',
              data: this.chartHumidityData,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Values'
              }
            }
          }
        }
      });
    } else {
      console.error('Could not get the canvas context for the chart.');
    }
  }
}