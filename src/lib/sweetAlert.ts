// // lib/sweetAlert.ts

// import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

// class SweetAlertService {
//   // Success Alert
//   static success(
//     title: string = 'Success!',
//     text: string = '',
//     options: SweetAlertOptions = {}
//   ): Promise<SweetAlertResult> {
//     return Swal.fire({
//       title,
//       text,
//       icon: 'success',
//       showConfirmButton: false,
//       timer: 2000,
//       timerProgressBar: true,
//       ...options,
//     });
//   }

//   // Error Alert - FIXED: Made closable
//   static error(
//     title: string = 'Error!',
//     text: string = '',
//     options: SweetAlertOptions = {}
//   ): Promise<SweetAlertResult> {
//     return Swal.fire({
//       timer: 2000,
//       title,
//       text,
//       icon: 'error',
//       confirmButtonText: 'OK',
//       confirmButtonColor: '#6b0016',
//       showCancelButton: false,
//       allowOutsideClick: true, // Changed to true
//       allowEscapeKey: true,     // Changed to true
//       allowEnterKey: true,       // Changed to true
//       ...options,
//     });
//   }

//   // Warning Alert - FIXED: Made closable
//   static warning(
//     title: string = 'Warning!',
//     text: string = '',
//     options: SweetAlertOptions = {}
//   ): Promise<SweetAlertResult> {
//     return Swal.fire({
//       timer: 2000,
//       title,
//       text,
//       icon: 'warning',
//       confirmButtonText: 'OK',
//       confirmButtonColor: '#f59e0b',
//       allowOutsideClick: true,   // Added
//       allowEscapeKey: true,      // Added
//       ...options,
//     });
//   }

//   // Info Alert - FIXED: Made closable
//   static info(
//     title: string = 'Info',
//     text: string = '',
//     options: SweetAlertOptions = {}
//   ): Promise<SweetAlertResult> {
//     return Swal.fire({
//       timer: 2000,
//       title,
//       text,
//       icon: 'info',
//       confirmButtonText: 'OK',
//       confirmButtonColor: '#3b82f6',
//       allowOutsideClick: true,   // Added
//       allowEscapeKey: true,      // Added
//       ...options,
//       customClass: {
//         popup: 'swal-top-layer'
//       },
//     });
//   }

//   // Confirm Dialog
//   static confirm(
//     title: string = 'Are you sure?',
//     text: string = '',
//     confirmButtonText: string = 'Yes',
//     cancelButtonText: string = 'Cancel'
//   ): Promise<SweetAlertResult> {
//     return Swal.fire({
//       timer: 2000,
//       title,
//       text,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#6b0016',
//       cancelButtonColor: '#6b7280',
//       confirmButtonText,
//       cancelButtonText,
//       allowOutsideClick: true,    // Added
//       allowEscapeKey: true,       // Added
//     });
//   }

//   // Loading Alert (keep as is - shouldn't be closable during loading)
//   static loading(
//     title: string = 'Loading...',
//     text: string = 'Please wait'
//   ): Promise<SweetAlertResult> {
//     return Swal.fire({
//       timer: 2000,
//       title,
//       text,
//       allowOutsideClick: false,    // Keep false for loading
//       allowEscapeKey: false,       // Keep false for loading
//       allowEnterKey: false,        // Keep false for loading
//       showConfirmButton: false,
//       willOpen: () => {
//         Swal.showLoading();
//       },
//     });
//   }

//   // Close all alerts
//   static close() {
//     Swal.close();
//   }
// }

// export default SweetAlertService;


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
      allowOutsideClick: true,
      allowEscapeKey: true,
      allowEnterKey: true,
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
      allowOutsideClick: true,
      allowEscapeKey: true,
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
      allowOutsideClick: true,
      allowEscapeKey: true,
      ...options,
      customClass: {
        popup: 'swal-top-layer',
        ...options.customClass,
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
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6b0016',
      cancelButtonColor: '#6b7280',
      confirmButtonText,
      cancelButtonText,
      allowOutsideClick: true,
      allowEscapeKey: true,
    });
  }

  // Input Dialog - NEW
  static async input(
    title: string,
    text?: string,
    options?: {
      inputPlaceholder?: string;
      inputValue?: string;
      confirmButtonText?: string;
      cancelButtonText?: string;
    }
  ): Promise<{ isConfirmed: boolean; value: string | null }> {
    const result = await Swal.fire({
      title,
      text: text || '',
      input: 'text',
      inputPlaceholder: options?.inputPlaceholder || 'Enter value',
      inputValue: options?.inputValue || '',
      showCancelButton: true,
      confirmButtonColor: '#6b0016',
      cancelButtonColor: '#6b7280',
      confirmButtonText: options?.confirmButtonText || 'Confirm',
      cancelButtonText: options?.cancelButtonText || 'Cancel',
      allowOutsideClick: true,
      allowEscapeKey: true,
      inputValidator: (value) => {
        if (!value) {
          return 'This field is required!';
        }
        return null;
      },
    });

    return {
      isConfirmed: result.isConfirmed,
      value: result.isConfirmed ? result.value : null,
    };
  }

  // Generic Fire method - NEW
  static fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
    return Swal.fire(options);
  }

  // Custom HTML Alert - Convenience method
  static html(
    title: string,
    html: string,
    options?: SweetAlertOptions
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      html,
      confirmButtonText: 'Close',
      confirmButtonColor: '#6b0016',
      ...options,
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

  // Toast notification - NEW
  static toast(
    title: string,
    icon: 'success' | 'error' | 'warning' | 'info' = 'success',
    timer: number = 3000
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      icon,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
    });
  }

  // Close all alerts
  static close() {
    Swal.close();
  }
}

export default SweetAlertService;