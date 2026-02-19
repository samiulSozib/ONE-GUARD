// lib/sweetAlert.ts

import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

class SweetAlertService {
  // Success Alert
  static success(
    title: string = 'Success!',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      ...options,
    });
  }

  // Error Alert - FIXED: Made closable
  static error(
    title: string = 'Error!',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      timer: 2000,
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#6b0016',
      showCancelButton: false,
      allowOutsideClick: true, // Changed to true
      allowEscapeKey: true,     // Changed to true
      allowEnterKey: true,       // Changed to true
      ...options,
    });
  }

  // Warning Alert - FIXED: Made closable
  static warning(
    title: string = 'Warning!',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      timer: 2000,
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b',
      allowOutsideClick: true,   // Added
      allowEscapeKey: true,      // Added
      ...options,
    });
  }

  // Info Alert - FIXED: Made closable
  static info(
    title: string = 'Info',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      timer: 2000,
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
      allowOutsideClick: true,   // Added
      allowEscapeKey: true,      // Added
      ...options,
      customClass: {
        popup: 'swal-top-layer'
      },
    });
  }

  // Confirm Dialog
  static confirm(
    title: string = 'Are you sure?',
    text: string = '',
    confirmButtonText: string = 'Yes',
    cancelButtonText: string = 'Cancel'
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      timer: 2000,
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6b0016',
      cancelButtonColor: '#6b7280',
      confirmButtonText,
      cancelButtonText,
      allowOutsideClick: true,    // Added
      allowEscapeKey: true,       // Added
    });
  }

  // Loading Alert (keep as is - shouldn't be closable during loading)
  static loading(
    title: string = 'Loading...',
    text: string = 'Please wait'
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      timer: 2000,
      title,
      text,
      allowOutsideClick: false,    // Keep false for loading
      allowEscapeKey: false,       // Keep false for loading
      allowEnterKey: false,        // Keep false for loading
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
  }

  // Close all alerts
  static close() {
    Swal.close();
  }
}

export default SweetAlertService;