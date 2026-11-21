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

const TOP_LAYER_CLASS = 'swal-top-layer';

/**
 * Shared defaults so SweetAlert2 stays clickable above Radix Dialogs
 * (z-index + pointer-events). Merge caller customClass without dropping ours.
 */
function withTopLayer(
  options: SweetAlertOptions = {}
): SweetAlertOptions {
  const incoming = options.customClass;
  const incomingObj =
    typeof incoming === 'string'
      ? { popup: incoming }
      : incoming && typeof incoming === 'object'
        ? incoming
        : {};

  const mergeClass = (
    key: 'container' | 'popup',
    extra?: string
  ) => {
    const existing =
      (incomingObj as Record<string, string | undefined>)[key] || '';
    return [TOP_LAYER_CLASS, existing, extra]
      .filter(Boolean)
      .join(' ');
  };

  return {
    heightAuto: false,
    ...options,
    customClass: {
      ...incomingObj,
      container: mergeClass('container'),
      popup: mergeClass('popup'),
    },
    didOpen: (popup, ...args) => {
      const container = popup.closest(
        '.swal2-container'
      ) as HTMLElement | null;

      if (container) {
        container.style.zIndex = '100000';
        container.style.pointerEvents = 'auto';
      }

      popup.style.pointerEvents = 'auto';
      options.didOpen?.(popup, ...args);
    },
  };
}

class SweetAlertService {
  // Success Alert
  static success(
    title: string = 'Success!',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire(
      withTopLayer({
        title,
        text,
        icon: 'success',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        ...options,
      })
    );
  }

  // Error Alert
  static error(
    title: string = 'Error!',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire(
      withTopLayer({
        title,
        text,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#6b0016',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        ...options,
      })
    );
  }

  // Warning Alert
  static warning(
    title: string = 'Warning!',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire(
      withTopLayer({
        title,
        text,
        icon: 'warning',
        confirmButtonText: 'OK',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        ...options,
      })
    );
  }

  // Info Alert
  static info(
    title: string = 'Info',
    text: string = '',
    options: SweetAlertOptions = {}
  ): Promise<SweetAlertResult> {
    return Swal.fire(
      withTopLayer({
        title,
        text,
        icon: 'info',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3b82f6',
        allowOutsideClick: true,
        allowEscapeKey: true,
        ...options,
      })
    );
  }

  // Confirm Dialog — no timer; must stay interactive over Radix Dialogs
  static confirm(
    title: string = 'Are you sure?',
    text: string = '',
    confirmButtonText: string = 'Yes',
    cancelButtonText: string = 'Cancel'
  ): Promise<SweetAlertResult> {
    return Swal.fire(
      withTopLayer({
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
      })
    );
  }

  // Input Dialog
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
    const result = await Swal.fire(
      withTopLayer({
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
      })
    );

    return {
      isConfirmed: result.isConfirmed,
      value: result.isConfirmed ? result.value : null,
    };
  }

  // Generic Fire method
  static fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
    return Swal.fire(withTopLayer(options));
  }

  // Custom HTML Alert
  static html(
    title: string,
    html: string,
    options?: SweetAlertOptions
  ): Promise<SweetAlertResult> {
    return Swal.fire(
      withTopLayer({
        title,
        html,
        confirmButtonText: 'Close',
        confirmButtonColor: '#6b0016',
        ...options,
      })
    );
  }

  // Loading Alert
  static loading(
    title: string = 'Loading...',
    text: string = 'Please wait'
  ): Promise<SweetAlertResult> {
    return Swal.fire(
      withTopLayer({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
    );
  }

  // Toast notification
  static toast(
    title: string,
    icon: 'success' | 'error' | 'warning' | 'info' = 'success',
    timer: number = 3000
  ): Promise<SweetAlertResult> {
    return Swal.fire(
      withTopLayer({
        title,
        icon,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer,
        timerProgressBar: true,
      })
    );
  }

  // Close all alerts
  static close() {
    Swal.close();
  }
}

export default SweetAlertService;
