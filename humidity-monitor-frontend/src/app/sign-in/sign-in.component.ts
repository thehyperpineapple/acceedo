import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; // Import FormBuilder and Validators
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  signInForm: FormGroup; // Define the form group
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router) {
    this.signInForm = this.fb.group({ // Initialize the form
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  saveCustomer() {
    if (this.signInForm.valid) {
      const { username, password } = this.signInForm.value;
      console.log('Form Data:', { username, password });

      this.loginService.saveCustomer(username, password).subscribe(
        (response: any) => {
          console.log('Server Response:', response);

          // if (response && response.status === "success") { 
          //   this.successMessage = 'Login Successful!!!';
          //   this.errorMessage = '';
          //   this.router.navigate(['/graph']);
          // } else {
          //   this.errorMessage = response.message || 'Invalid credentials.';
          //   this.successMessage = '';
          // }
          //Changed the above to check if token is returned, if returned then login is successful
          if (response && response.token) {
            this.successMessage = 'Login Successful!!!';
            this.errorMessage = '';
            localStorage.setItem('token', response.token);
            this.router.navigate(['/graph']);
          } else {  
            this.errorMessage = response.detail || 'Invalid credentials.';
            this.successMessage = '';
            console.log('Error:', this.errorMessage);
          }
        },
        (error: HttpErrorResponse) => {
          console.error('Error occurred:', error);
          this.errorMessage = error.error.detail || 'An error occurred. Please try again.';
          this.successMessage = '';
        }
      );
    }
  }
}
