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

  // Error Alert
// Error Alert
static error(
  title: string = 'Error!',
  text: string = '',
  options: SweetAlertOptions = {}
): Promise<SweetAlertResult> {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#6b0016',
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    ...options,
  });
}

  // Warning Alert
  static warning(
    title: string = 'Warning!',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b',
      ...options,
    });
  }

  // Info Alert
  static info(
    title: string = 'Info',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
      ...options,
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
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6b0016',
      cancelButtonColor: '#6b7280',
      confirmButtonText,
      cancelButtonText,
    });
  }

  // Loading Alert
  static loading(
    title: string = 'Loading...',
    text: string = 'Please wait'
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
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