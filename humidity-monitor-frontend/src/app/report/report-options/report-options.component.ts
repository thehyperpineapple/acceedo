import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { stat } from 'fs';

@Component({
  selector: 'app-report-options',
  templateUrl: './report-options.component.html',
  styleUrls: ['./report-options.component.css']
})
export class ReportOptionsComponent implements OnInit {
  reportForm: FormGroup;
  boards: number[] = [];
  unitId!: number;
  private baseUrl = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private _dialogRef: MatDialogRef<ReportOptionsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient
  ) {
    this.reportForm = this.fb.group({
      board: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      format: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBoards();
  }

  getBoardIDs(): Observable<{ unitIDs: number[] }> {
    return this.http.get<{ unitIDs: number[] }>(`${this.baseUrl}/external/getUnitCount`);
  }

  onFormSubmit(): void {
    if (this.reportForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }
    let { board, startDate, endDate, format } = this.reportForm.value;
    startDate.setDate(startDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);
    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
    const url = `http://localhost:3000/report/${board}?end_date=${formattedEndDate}&start_date=${formattedStartDate}&format=${format}`;

    // Simple approach: open the file in a new window/tab to trigger download
    window.open(url, '_blank');

    // Close the dialog if needed
    this._dialogRef.close(true);
  }

  // Handle success
  handleSuccess(message: string): void {
    alert(message);
    this.reportForm.reset();
    this._dialogRef.close(true);
  }
  loadBoards(): void {
    this.getBoardIDs().subscribe({
      next: (response) => {
        this.boards = response.unitIDs;
      },
      error: (err) => this.handleError('Failed to load boards', err)
    });
  }
  // Handle errors
  handleError(message: string, err: any): void {
    console.error(message, err);
    alert(message);
  }

  // Handle cancel action
  onCancel(): void {
    this.reportForm.reset();
    this._dialogRef.close();
  }
}