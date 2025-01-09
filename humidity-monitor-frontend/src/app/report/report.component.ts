import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { GoogleChartInterface } from 'ng2-google-charts';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent {

  isSidebarOpen = false; // Initial state of the sidebar

  toggleSidebar() {
    console.log('Sidebar toggled'); // Add this line for debugging
    this.isSidebarOpen = !this.isSidebarOpen; // Toggle the sidebar state
  }
  
  displayedColumns: string[] = ['time', 'temperature', 'humidity'];
dataSource = new MatTableDataSource([
  { time: '12:00 PM', temperature: 25, humidity: 45 },
  { time: '1:00 PM', temperature: 26, humidity: 50 },
  // Add more sample data as needed
]);

applyFilter(event: Event) {
  const filterValue = (event.target as HTMLInputElement).value;
  this.dataSource.filter = filterValue.trim().toLowerCase();
}



public lineChart2: GoogleChartInterface = {
  chartType: 'LineChart',
  dataTable: [
    ['Time', 'Humidity', 'Temperature'],  // Updated column titles with Time
    [new Date(2024, 9, 15, 10, 0, 0), 30, 25],  // Time: 10:00:00
    [new Date(2024, 9, 15, 10, 0, 10), 40, 27], // Time: 10:00:10 (10 sec later)
    [new Date(2024, 9, 15, 10, 0, 20), 42, 29], // Time: 10:00:20 (20 sec later)
    [new Date(2024, 9, 15, 10, 0, 30), 45, 30], // Time: 10:00:30
    [new Date(2024, 9, 15, 10, 0, 40), 47, 31], // Time: 10:00:40
    [new Date(2024, 9, 15, 10, 0, 50), 50, 33], // Time: 10:00:50
    [new Date(2024, 9, 15, 10, 1, 0), 55, 34],  // Time: 10:01:00
    [new Date(2024, 9, 15, 10, 1, 10), 60, 35], // Time: 10:01:10
    [new Date(2024, 9, 15, 10, 1, 20), 65, 36], // Time: 10:01:20
    [new Date(2024, 9, 15, 10, 1, 30), 70, 38], // Time: 10:01:30
    [new Date(2024, 9, 15, 10, 1, 40), 75, 40], // Time: 10:01:40
    [new Date(2024, 9, 15, 10, 1, 50), 80, 42], // Time: 10:01:50
    [new Date(2024, 9, 15, 10, 2, 0), 82, 43],  // Time: 10:02:00
    [new Date(2024, 9, 15, 10, 2, 10), 85, 45], // Time: 10:02:10
    [new Date(2024, 9, 15, 10, 2, 20), 87, 46], // Time: 10:02:20
    [new Date(2024, 9, 15, 10, 2, 30), 90, 48], // Time: 10:02:30
    [new Date(2024, 9, 15, 10, 2, 40), 92, 49], // Time: 10:02:40
    [new Date(2024, 9, 15, 10, 2, 50), 95, 51], // Time: 10:02:50
    [new Date(2024, 9, 15, 10, 3, 0), 100, 53], // Time: 10:03:00
    [new Date(2024, 9, 15, 10, 3, 10), 102, 54], // Time: 10:03:10
    [new Date(2024, 9, 15, 10, 3, 20), 105, 55], // Time: 10:03:20
    [new Date(2024, 9, 15, 10, 3, 30), 107, 56], // Time: 10:03:30
    [new Date(2024, 9, 15, 10, 3, 40), 110, 58], // Time: 10:03:40
    [new Date(2024, 9, 15, 10, 3, 50), 112, 60], // Time: 10:03:50
    [new Date(2024, 9, 15, 10, 4, 0), 115, 62],  // Time: 10:04:00
    [new Date(2024, 9, 15, 10, 4, 10), 117, 63], // Time: 10:04:10
    [new Date(2024, 9, 15, 10, 4, 20), 120, 65], // Time: 10:04:20
    [new Date(2024, 9, 15, 10, 4, 30), 122, 66], // Time: 10:04:30
    [new Date(2024, 9, 15, 10, 4, 40), 125, 68], // Time: 10:04:40
    [new Date(2024, 9, 15, 10, 4, 50), 127, 70], // Time: 10:04:50
    [new Date(2024, 9, 15, 10, 5, 0), 130, 72],  // Time: 10:05:00
    [new Date(2024, 9, 15, 10, 5, 10), 132, 73], // Time: 10:05:10
    [new Date(2024, 9, 15, 10, 5, 20), 135, 74], // Time: 10:05:20
    [new Date(2024, 9, 15, 10, 5, 30), 138, 76], // Time: 10:05:30
    [new Date(2024, 9, 15, 10, 5, 40), 140, 78], // Time: 10:05:40
    [new Date(2024, 9, 15, 10, 5, 50), 142, 79], // Time: 10:05:50
    [new Date(2024, 9, 15, 10, 6, 0), 145, 80],  // Time: 10:06:00
    [new Date(2024, 9, 15, 10, 6, 10), 148, 81], // Time: 10:06:10
    [new Date(2024, 9, 15, 10, 6, 20), 150, 83], // Time: 10:06:20
    [new Date(2024, 9, 15, 10, 6, 30), 152, 84], // Time: 10:06:30
    [new Date(2024, 9, 15, 10, 6, 40), 155, 86], // Time: 10:06:40
    [new Date(2024, 9, 15, 10, 6, 50), 157, 87], // Time: 10:06:50
    [new Date(2024, 9, 15, 10, 7, 0), 160, 89],  // Time: 10:07:00
    [new Date(2024, 9, 15, 10, 7, 10), 162, 90], // Time: 10:07:10
    [new Date(2024, 9, 15, 10, 7, 20), 165, 91], // Time: 10:07:20
    
    [new Date(2024, 9, 15, 10, 8, 20), 180, 100]  // Time: 10:08:20
  ],
  options: {
   
    hAxis: {
      title: 'Time',
      format: 'HH:mm:ss',  // Format the time displayed on the x-axis
      gridlines: { count: -1 }, // Optional: let Google Charts decide the gridlines
    },
    vAxis: { title: 'Value', minValue: 0 },
    legend: { position: 'top' },
    colors: ['#1b9e77', '#d95f02'], // Optional: custom colors for lines
    curveType: 'function', // Optional: makes the lines smooth
    height: 400,
    chartArea: {
      left: '10%',  
      right: '5%',  
      top: '5%',    
      bottom: '15%'  
    }, // Optional: height of the chart
   
    explorer: {
      actions: ['dragToZoom', 'rightClickToReset'], // Allow zooming
      axis: 'horizontal', // Enable zooming on the x-axis
      keepInBounds: true, // Keep the view within the data bounds
      maxZoomIn: 4.0 // Maximum zoom level
    }
  }
};


}
