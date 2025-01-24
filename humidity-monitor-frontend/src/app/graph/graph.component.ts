import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GoogleChartInterface } from 'ng2-google-charts';
import { DataService } from './datas.service';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent {
  charts: { unit_ID: number; lineChart: GoogleChartInterface }[] = [];
  isBrowser: boolean = false;
  liveDataSubscriptions: { [key: number]: Subject<any> } = {};
  selectedDates: { [key: number]: Date } = {};
  isTodayGraph: boolean = true;
  isDownloadPopupOpen = false;
  selectedUnitID: number | null = null;
  apiUrl = environment.apiUrl;

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.initializeSelectedDates();
      this.fetchHistoricalData(this.selectedDates);
      this.setupWebSocketConnections();
    }
  }

  initializeSelectedDates() {
    // Fetch unit IDs from the API
    this.http
      .get<{ message: string; unitCount: number; unitIDs: number[] }>(
        `${this.apiUrl}/external/getUnitCount`
      )
      .subscribe(
        (data) => {
          const unitIDs = data.unitIDs;
          const unit_ID = data.unitIDs;
  
          // Ensure unitIDs exist before processing
          if (unitIDs && unitIDs.length > 0) {
            unitIDs.forEach((unit_ID) => {
              // console.log(unit_ID);
              this.selectedDates[unit_ID] = new Date(); // Initialize selectedDates for each unit_ID
            });
          }
        },
        (error) => {
          console.error('Error fetching unit IDs:', error);
        }
      );
  }
  

  fetchHistoricalData(selectedDates: { [key: number]: Date }) {
    const unitIDs = Object.keys(selectedDates);

    unitIDs.forEach(unit_ID => {
      const selectedDate = selectedDates[Number(unit_ID)];
      const startTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 8, 30);
      const endTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 13, 59, 59);

      this.dataService.getChartDataByUnitID(Number(unit_ID), startTime, endTime).subscribe(
        (response) => {
          const filteredData = this.processChartData(response.data, selectedDate);
          this.setupChart(filteredData, Number(unit_ID));
        },
        (error: any) => {
          console.error('Error fetching data:', error);
        }
      );
    });
  }

  onDateChange(event: any, unit_ID: number) {
    const selectedDate = new Date(event.target.value);
    this.selectedDates[unit_ID] = selectedDate;
    this.fetchHistoricalData(this.selectedDates);
    this.isTodayGraph = selectedDate.toDateString() === new Date().toDateString();
  }

  processChartData(data: any[], selectedDate: Date) {
    return data
      .map((item: any) => [
        new Date(item[0]),
        Number(item[1]),
        Number(item[2])
      ] as [Date, number, number])
      .filter((dataPoint: [Date, number, number]) => {
        const dataDate = dataPoint[0];
        const startTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 8, 30);
        const endTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 13, 59, 59);

        return dataDate >= startTime && dataDate <= endTime;
      });
  }

  setupChart(chartData: any[], unit_ID: number) {
    const formattedData = [
      ['Time', 'Humidity', 'Temperature'],
      ...chartData.map(item => [
        new Date(item[0]),
        Number(item[1]),
        Number(item[2])
      ])
    ];

    const newChart: GoogleChartInterface = {
      chartType: 'LineChart',
      dataTable: formattedData,
      options: {
        hAxis: { title: 'Time' },
        vAxis: { title: 'Value', minValue: 0 },
        legend: { position: 'top' },
        colors: ['#1b9e77', '#d95f02'],
        curveType: 'function',
        height: 350,
        width: 615,
        chartArea: {
          left: '10%',
          right: '5%',
          top: '10%',
          bottom: '15%'
        },
        explorer: {
          actions: ['dragToZoom', 'rightClickToReset'],
          axis: 'horizontal',
          keepInBounds: true,
          maxZoomIn: 4.0
        }
      }
    };

    const existingChart = this.charts.find(c => c.unit_ID === unit_ID);
    if (existingChart) {
      existingChart.lineChart.dataTable = formattedData;
      if (existingChart.lineChart.component) {
        existingChart.lineChart.component.draw();
      }
    } else {
      this.charts.push({ unit_ID, lineChart: newChart });
    }
  }

  updateChartWithLiveData(liveData: any[], unit_ID: number) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30);
    const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 3, 29, 59);

    if (this.isTodayGraph && now >= startOfToday && now < endOfTomorrow) {
      const existingChart = this.charts.find(c => c.unit_ID === unit_ID);
      if (existingChart) {
        const updatedData = [
          ...existingChart.lineChart.dataTable.slice(1),
          ...liveData
        ];

        existingChart.lineChart.dataTable = [existingChart.lineChart.dataTable[0], ...updatedData];

        if (existingChart.lineChart.component) {
          existingChart.lineChart.component.draw();
        }
      }
    }
  }

  
  setupWebSocketConnections() {
    this.http
      .get<{ message: string; unitCount: number; unitIDs: number[] }>(
        `${this.apiUrl}/external/getUnitCount`
      )
      .subscribe(
        (data) => {
          const unitIDs = data.unitIDs;
          // const unit_ID = data.unitIDs;

    unitIDs.forEach(unit_ID => {
      this.liveDataSubscriptions[unit_ID] = new Subject<any>();

      this.dataService.getLiveData(unit_ID).subscribe((liveData: any[]) => {
        const processedLiveData = liveData.map((point: any) => [
          new Date(point[0]),
          Number(point[1]),
          Number(point[2])
        ]);
        this.updateChartWithLiveData(processedLiveData, unit_ID);
      }, (error: any) => {
        console.error(`Error fetching live data for unit ${unit_ID}:`, error);
      });
    });
  }
)
  }

  isSidebarOpen = false;

  toggleSidebar() {
    console.log('Sidebar toggled');
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  openDownloadPopup(unit_ID: number) {
    this.selectedUnitID = unit_ID;
    this.isDownloadPopupOpen = true;
  }

  closeDownloadPopup() {
    this.isDownloadPopupOpen = false;
    this.selectedUnitID = null;
  }

  onPrintClick(unit_ID: number, format: 'excel' | 'pdf') {
    const selectedDate = this.selectedDates[unit_ID];
    if (!selectedDate) {
      console.error('No date selected for this unit.');
      return;
    }
  
    const startTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 14, 0);
    const endTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 13, 59, 59);
  
    const formattedStartTime = startTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const formattedEndTime = endTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
  
    const url = `http://192.168.0.84:9001/download/${format}/${unit_ID}?start_time=${formattedStartTime}&end_time=${formattedEndTime}`;
  
    this.downloadFile(url, format);
  }
  
  downloadFile(url: string, format: 'excel' | 'pdf') {
    const mimeType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
    const fileName = format === 'excel' ? 'report.xlsx' : 'report.pdf';
  
    this.http.get(url, { responseType: 'blob' }).subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: mimeType });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
      (error: any) => {
        console.error('Error downloading the file:', error);
      }
    );
  }
  
  
}
