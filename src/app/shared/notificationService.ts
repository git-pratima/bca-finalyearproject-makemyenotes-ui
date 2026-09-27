import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'   // 🌍 GLOBAL
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {}

  private open(message: string, panelClass: string) {
     this.snackBar.open(message, 'Close', {
    duration: 3000,
    horizontalPosition: 'center',  // 👈 center horizontally
    verticalPosition: 'bottom',        // 👈 we’ll shift it vertically via CSS
    panelClass: [panelClass, 'center-offset-snackbar']
  });
  }

  success(message: string) {
    this.open(message, 'snackbar-success');
  }

  error(message: string) {
    this.open(message, 'snackbar-error');
  }

  info(message: string) {
    this.open(message, 'snackbar-info');
  }

  warning(message: string) {
    this.open(message, 'snackbar-warning');
  }
}
