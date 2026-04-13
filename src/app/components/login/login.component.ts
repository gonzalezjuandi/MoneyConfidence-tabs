import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() loggedIn = new EventEmitter<void>();

  accessProfile = 'Particular';
  dni = '';
  password = '';
  showPassword = false;
  errorMessage = '';

  get canSubmit(): boolean {
    return this.dni.trim().length > 0 && this.password.trim().length > 0;
  }

  onTogglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Login muy simple solo para demo: DNI 1234, contraseña 1234
    if (this.dni === '1234' && this.password === '1234') {
      this.errorMessage = '';
      this.loggedIn.emit();
    } else {
      this.errorMessage = 'DNI o contraseña incorrectos';
    }
  }
}

