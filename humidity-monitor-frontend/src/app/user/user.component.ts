import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserEditAddComponent } from './user-edit-add/user-edit-add.component';
import { UserService } from './user-edit-add/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  title = 'user';
  displayedColumns: string[] = ['S.No','user_ID', 'username', 'role', 'emailId', 'phoneNo', 'action'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _dialog: MatDialog, private _userService: UserService) {}

  ngOnInit(): void {
    this.getUserList(); // Load user list on component initialization
  }

  openAddEdit(data?: any) {
    const dialogRef = this._dialog.open(UserEditAddComponent, {
      width: '400px',
      data: data ? data : null,  // Pass `null` if no data is provided
    });
  
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.getUserList();  // Refresh the user list
        }
      },
      error: (err) => {
        console.error('Error after closing the dialog:', err);
      }
    });
  }  

  getUserList() {
    this._userService.getUserList().subscribe({
      next: (res) => {
        // Check if the response contains users
        if (res && Array.isArray(res.users)) {
          this.dataSource = new MatTableDataSource(res.users);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        } else if (res && res.msg) {
          console.warn(res.msg); // Log the message
        } else {
          console.error("Unexpected response format:", res);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  delUser(user_ID: string) {
    this._userService.delUser(user_ID).subscribe({
      next: () => {
        alert('User deleted successfully');
        this.getUserList(); // Refresh the user list
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert('Failed to delete user.'); // Optional alert for user feedback
      }
    });
  }
  

  openEdit(data: any) {
    const dialogRef = this._dialog.open(UserEditAddComponent, {
      data, // Ensure that `data` includes `userId` and other user details
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getUserList(); // Refresh user list if dialog was closed with a positive value
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
