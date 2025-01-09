import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetService } from './set.service';

@Component({
  selector: 'app-setting-edit-add',
  templateUrl: './setting-edit-add.component.html',
  styleUrls: ['./setting-edit-add.component.css']
})
export class SettingEditAddComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _userService: SetService,
    private _dialogRef: MatDialogRef<SettingEditAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data) {
      this.populateForm(this.data);  // Populate form if editing
    }
  }

  // Create a new form group
  createForm(): FormGroup {
    return this._fb.group({
      unit_ID: [null, Validators.required],  // Initialize with null
      humidity_high: ['', Validators.required],
      humidity_low: ['', Validators.required],
      temp_high: ['', Validators.required],
      temp_low: ['', Validators.required],
      water_level_high: ['', Validators.required],
      water_level_low: ['', Validators.required]
    });
  }

  // Populate form with data
  populateForm(data: any): void {
    this.userForm.patchValue({ ...data });  // Ensuring immutability with spread operator
  }

  // Handle form submission
  onFormSubmit(): void {
    const userData = { ...this.userForm.value };  // Using spread operator for immutability

    if (this.userForm.valid) {
      if (this.data) {
        this.updateServer(userData);
      } else {
        this.addServer(userData);
      }
    } else {
      console.error('Form is invalid');
      alert('Please fill in all required fields.');
    }
  }

  // Handle server update
  updateServer(userData: any): void {
    const unitId: number = this.data.unit_ID;  // Safely accessing unit_ID as a number

    this._userService.editUser(unitId, userData).subscribe({
      next: () => this.handleSuccess('Server updated successfully'),
      error: (err) => this.handleError('Failed to update server.', err)
    });
  }

  // Handle adding a new server
  addServer(userData: any): void {
    this._userService.addUser(userData).subscribe({
      next: () => this.handleSuccess('Server added successfully'),
      error: (err) => this.handleError('Failed to add server.', err)
    });
  }

  // Handle success and close dialog
  handleSuccess(message: string): void {
    alert(message);
    this.userForm.reset();  // Reset the form
    this._dialogRef.close(true);  // Close the dialog indicating success
  }

  // Handle errors
  handleError(message: string, err: any): void {
    console.error(message, err);
    alert(message);
  }

  // Handle cancel action
  onCancel(): void {
    this.userForm.reset();  // Reset form
    this._dialogRef.close();  // Close dialog without submitting
  }
}