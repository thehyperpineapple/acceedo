import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-edit-add',
  templateUrl: './user-edit-add.component.html',
  styleUrls: ['./user-edit-add.component.css'] // Fix typo here: should be styleUrls
})
export class UserEditAddComponent implements OnInit {
  userForm: FormGroup;
  loading = false; // For loading state

  constructor(
    private _fb: FormBuilder, 
    private _userService: UserService, 
    private _dialogref: MatDialogRef<UserEditAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this._fb.group({
      user_ID: ['', Validators.required], // Make sure this is included
      username: ['', Validators.required],
      role: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]], // Add validation
      phoneNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], // Example pattern for numbers
      password: [''] // Handle password separately if needed
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.userForm.patchValue(this.data); // Make sure data is passed correctly
    }
  }

  onFormSubmit() {
    if (this.userForm.invalid) {
      alert('Please fill in all required fields correctly.'); // Inform user of invalid input
      return;
    }
  
    const userData = this.userForm.value; // Get the form data
    this.loading = true; // Set loading state

    if (this.data) { // If editing an existing user
      const user_ID = userData.user_ID; // Use user_ID from form data
      this._userService.editUser(user_ID, userData).subscribe({
        next: (val: any) => {
          this.loading = false; // Reset loading state
          alert('User updated successfully');
          this.userForm.reset(); // Reset the form after submission
          this._dialogref.close(true); // Close dialog and pass true to indicate success
        },
        error: (err: any) => {
          this.loading = false; 
          console.log('User data to be submitted:', userData);
          console.error('Error details:', err); // More details on the error
          alert('Failed to update user.');
      }
      
      });
    } else { // If adding a new user
      this._userService.addUser(userData).subscribe({
        next: (val: any) => {
          this.loading = false; // Reset loading state
          alert('User added successfully');
          this.userForm.reset(); // Reset the form after submission
          this._dialogref.close(true); // Close dialog and pass true to indicate success
        },
        error: (err: any) => {
          this.loading = false; // Reset loading state
          console.error('Error adding user:', err);
          alert('Failed to add user.'); // Optional alert for user feedback
        }
      });
    }
  }
  
  onCancel(): void {
    this._dialogref.close(); // Close the dialog without returning any value
  }
}
