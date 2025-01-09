import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SettingEditAddComponent } from './setting-edit-add/setting-edit-add.component';
import { SetService } from './setting-edit-add/set.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Server, ServerResponse } from './setting.model'; // Ensure correct import paths

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  title = 'Server Management';
  displayedColumns: string[] = ['S.No', 'unit_ID', 'humidity_high', 'humidity_low', 'temp_high', 'temp_low', 'water_level_high', 'water_level_low', 'action'];
  dataSource = new MatTableDataSource<Server>(); // Initialize with Server type
  pageEvent!: PageEvent; // Use the definite assignment assertion here

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _dialog: MatDialog, private _userService: SetService) {}

  ngOnInit(): void {
    this.getServerList(); // Load server list on component initialization
  }

  getServerList() {
    this._userService.getUserList().subscribe({
      next: (res: ServerResponse) => {
        console.log('Response from getUserList:', res);
        
        if (res && res.servers && Array.isArray(res.servers)) {
          this.dataSource.data = res.servers;
        } else {
          console.error('Expected an array, but got:', res);
        }

        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err) => {
        console.error('Error fetching server list:', err);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageEvent = event;
    // Implement any additional logic you need for pagination here
  }
  
  openAddEdit(data?: Server) {
    const dialogRef = this._dialog.open(SettingEditAddComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getServerList(); // Refresh the server list after dialog closes
        }
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  delUser(unit_ID: number) {
    // Log the unit_ID to ensure it's being passed correctly
    console.log(`Attempting to delete server with ID: ${unit_ID}`);
  
    // Directly call the delete service without confirmation
    this._userService.delUser(unit_ID).subscribe({
      next: () => {
        alert('Server deleted successfully');
        this.getServerList(); // Refresh the list after successful deletion
      },
      error: (err) => {
        console.error('Error deleting server:', err);
        alert('Failed to delete server.');
      }
    });
  }
  
  openEdit(data: Server) {
    const dialogRef = this._dialog.open(SettingEditAddComponent, {
      data,
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getServerList(); // Refresh the server list after dialog closes
        }
      }
    });
  }
  isSidebarOpen = false; // Initial state of the sidebar

  toggleSidebar() {
    console.log('Sidebar toggled'); // Add this line for debugging
    this.isSidebarOpen = !this.isSidebarOpen; // Toggle the sidebar state
  }
}

