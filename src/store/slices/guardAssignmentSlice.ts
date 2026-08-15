// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { guardAssignmentService } from "@/service/guardAssignment.service";
// import {
//     CreateGuardAssignmentDto,
//   GuardAssignment,
//   GuardAssignmentParams,
//   GuardAssignmentState
// } from "@/app/types/guardAssignment"; // Fixed import path

// const initialState: GuardAssignmentState = {
//   assignments: [],
//   currentAssignment: null,
//   pagination: {
//     current_page: 1,
//     last_page: 1,
//     total: 0,
//     per_page: 10,
//   },
//   isLoading: false,
//   error: null,
// };

// /* ------------------ Thunks ------------------ */

// export const fetchAssignments = createAsyncThunk(
//   "guardAssignment/fetchAssignments",
//   async (params: GuardAssignmentParams = {}, { rejectWithValue }) => {
//     try {
//       const response=await guardAssignmentService.getAssignments(params);
//       console.log(response)
//       return response
//     } catch (error: unknown) {
//       console.log(error)
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Failed to fetch guard assignments";
//       return rejectWithValue(message);
//     }
//   }
// );

// export const fetchAssignment = createAsyncThunk(
//   "guardAssignment/fetchAssignment",
//   async (
//     { id, params }: { id: number; params?: { include?: string[] } },
//     { rejectWithValue }
//   ) => {
//     try {
//       return await guardAssignmentService.getAssignment(id, params);
//     } catch (error: unknown) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Failed to fetch guard assignment";
//       return rejectWithValue(message);
//     }
//   }
// );

// export const createAssignment = createAsyncThunk(
//   "guardAssignment/createAssignment",
//   async (
//     data:CreateGuardAssignmentDto,
//     { rejectWithValue }
//   ) => {
//     try {
//       return await guardAssignmentService.createAssignment(data);
//     } catch (error: unknown) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Failed to create guard assignment";
//       return rejectWithValue(message);
//     }
//   }
// );

// export const updateAssignment = createAsyncThunk(
//   "guardAssignment/updateAssignment",
//   async (
//     { id, data }: { id: number; data: CreateGuardAssignmentDto },
//     { rejectWithValue }
//   ) => {
//     try {
//       return await guardAssignmentService.updateAssignment(id, data);
//     } catch (error: unknown) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Failed to update guard assignment";
//       return rejectWithValue(message);
//     }
//   }
// );

// export const deleteAssignment = createAsyncThunk(
//   "guardAssignment/deleteAssignment",
//   async (id: number, { rejectWithValue }) => {
//     try {
//       await guardAssignmentService.deleteAssignment(id);
//       return id;
//     } catch (error: unknown) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Failed to delete guard assignment";
//       return rejectWithValue(message);
//     }
//   }
// );

// export const updateAssignmentStatus = createAsyncThunk(
//   "guardAssignment/updateStatus",
//   async (
//     { id, status }: { id: number; status: string }, // Fixed: changed 'stauts' to 'status'
//     { rejectWithValue }
//   ) => {
//     try {
//        await guardAssignmentService.updateStatusStatus(id, status);
//        const updatedGuardAssignement=await guardAssignmentService.getAssignment(id)
//        return updatedGuardAssignement.item
//     } catch (error: unknown) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Failed to update guard assignment status";
//       return rejectWithValue(message);
//     }
//   }
// );

// /* ------------------ Slice ------------------ */

// const guardAssignmentSlice = createSlice({
//   name: "guardAssignment",
//   initialState,
//   reducers: {
//     clearAssignmentError: (state) => {
//       state.error = null;
//     },
//     clearCurrentAssignment: (state) => {
//       state.currentAssignment = null;
//     },
//     setAssignments: (state, action: PayloadAction<GuardAssignment[]>) => {
//       state.assignments = action.payload;
//     },
//     updateAssignmentInList: (state, action: PayloadAction<GuardAssignment>) => {
//       const index = state.assignments.findIndex(
//         (assignment) => assignment.id === action.payload.id
//       );
//       if (index !== -1) {
//         state.assignments[index] = action.payload;
//       }
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch assignments
//       .addCase(fetchAssignments.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAssignments.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.assignments = action.payload.items;
//         state.pagination = action.payload.data;
//       })
//       .addCase(fetchAssignments.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })

//       // Fetch single assignment
//       .addCase(fetchAssignment.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchAssignment.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.currentAssignment = action.payload.item;
//       })
//       .addCase(fetchAssignment.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })

//       // Create assignment
//       .addCase(createAssignment.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(createAssignment.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.assignments = [action.payload.item, ...state.assignments];
//         state.currentAssignment = action.payload.item;
//         state.pagination.total += 1;
//       })
//       .addCase(createAssignment.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })

//       // Update assignment
//       .addCase(updateAssignment.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(updateAssignment.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const index = state.assignments.findIndex(
//           (assignment) => assignment.id === action.payload.item.id
//         );
//         if (index !== -1) {
//           state.assignments[index] = action.payload.item;
//         }
//         if (state.currentAssignment?.id === action.payload.item.id) {
//           state.currentAssignment = action.payload.item;
//         }
//       })
//       .addCase(updateAssignment.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })

//       // Delete assignment
//       .addCase(deleteAssignment.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(deleteAssignment.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.assignments = state.assignments.filter(
//           (assignment) => assignment.id !== action.payload
//         );
//         if (state.currentAssignment?.id === action.payload) {
//           state.currentAssignment = null;
//         }
//         state.pagination.total = Math.max(
//           0,
//           state.pagination.total - 1
//         );
//       })
//       .addCase(deleteAssignment.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       })

//       // update status
//       .addCase(updateAssignmentStatus.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(updateAssignmentStatus.fulfilled, (state, action) => {
//         state.isLoading = false;
//         const index = state.assignments.findIndex(
//           (assignment) => assignment.id === action.payload.id
//         );
//         if (index !== -1) {
//           state.assignments[index] = action.payload;
//         }
//         if (state.currentAssignment?.id === action.payload.id) {
//           state.currentAssignment = action.payload;
//         }
//       })
//       .addCase(updateAssignmentStatus.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export const {
//   clearAssignmentError,
//   clearCurrentAssignment,
//   setAssignments,
//   updateAssignmentInList,
// } = guardAssignmentSlice.actions;

// export default guardAssignmentSlice.reducer;


// store/slices/guardAssignmentSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { guardAssignmentService, ReplaceGuardResponse } from "@/service/guardAssignment.service";
import {
  GuardAssignment,
  GuardAssignmentParams,
  GuardAssignmentState,
  CreateGuardAssignmentDto,
  UpdateGuardAssignmentDto,
  BulkScheduleDto,
  BulkScheduleResponse,
  ReplaceGuardDto,
  CancelAssignmentDto,
  ChangeAssignmentStatusDto,
  GuardAssignmentStatus,
} from "@/app/types/guardAssignment";

const initialState: GuardAssignmentState = {
  assignments: [],
  currentAssignment: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
};

// Status display helper
export const getStatusDisplay = (status: GuardAssignmentStatus): string => {
  const statusMap: Record<GuardAssignmentStatus, string> = {
    assigned: 'Assigned',
    accepted: 'Accepted',
    checked_in: 'Checked In',
    on_duty: 'On Duty',
    completed: 'Completed',
    late: 'Late',
    no_show: 'No Show',
    cancelled: 'Cancelled',
    replaced: 'Replaced',
  };
  return statusMap[status] || status;
};

// Status color helper
export const getStatusColor = (status: GuardAssignmentStatus): string => {
  const colorMap: Record<GuardAssignmentStatus, string> = {
    assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    checked_in: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    on_duty: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    no_show: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    cancelled: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    replaced: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Status badge variant helper
export const getStatusBadgeVariant = (status: GuardAssignmentStatus): string => {
  const variantMap: Record<GuardAssignmentStatus, string> = {
    assigned: 'default',
    accepted: 'success',
    checked_in: 'secondary',
    on_duty: 'success',
    completed: 'outline',
    late: 'warning',
    no_show: 'destructive',
    cancelled: 'destructive',
    replaced: 'secondary',
  };
  return variantMap[status] || 'default';
};

// ------------------ Thunks ------------------

// Fetch all guard assignments
export const fetchAssignments = createAsyncThunk(
  "guardAssignment/fetchAssignments",
  async (params: GuardAssignmentParams = {}, { rejectWithValue }) => {
    try {
      const response = await guardAssignmentService.getAssignments(params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch guard assignments";
      return rejectWithValue(message);
    }
  }
);

// Fetch single guard assignment
export const fetchAssignment = createAsyncThunk(
  "guardAssignment/fetchAssignment",
  async (
    { id, params }: { id: number; params?: { include?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      const response = await guardAssignmentService.getAssignment(id, params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch guard assignment";
      return rejectWithValue(message);
    }
  }
);

// Create single guard assignment
export const createAssignment = createAsyncThunk(
  "guardAssignment/createAssignment",
  async (
    data: CreateGuardAssignmentDto,
    { rejectWithValue }
  ) => {
    try {
      const response = await guardAssignmentService.createAssignment(data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create guard assignment";
      return rejectWithValue(message);
    }
  }
);

// Update guard assignment
export const updateAssignment = createAsyncThunk(
  "guardAssignment/updateAssignment",
  async (
    { id, data }: { id: number; data: UpdateGuardAssignmentDto },
    { rejectWithValue }
  ) => {
    try {
      const response = await guardAssignmentService.updateAssignment(id, data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update guard assignment";
      return rejectWithValue(message);
    }
  }
);

// Delete guard assignment
export const deleteAssignment = createAsyncThunk(
  "guardAssignment/deleteAssignment",
  async (id: number, { rejectWithValue }) => {
    try {
      await guardAssignmentService.deleteAssignment(id);
      return id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete guard assignment";
      return rejectWithValue(message);
    }
  }
);

// Update assignment status
export const updateAssignmentStatus = createAsyncThunk(
  "guardAssignment/updateStatus",
  async (
    { id, status }: { id: number; status: GuardAssignmentStatus },
    { rejectWithValue }
  ) => {
    try {
      const response = await guardAssignmentService.updateAssignmentStatus(id, status);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update guard assignment status";
      return rejectWithValue(message);
    }
  }
);

// Bulk schedule assignments
export const bulkScheduleAssignments = createAsyncThunk(
  "guardAssignment/bulkSchedule",
  async (data: BulkScheduleDto, { rejectWithValue }) => {
    try {
      const response = await guardAssignmentService.bulkSchedule(data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to bulk schedule guard assignments";
      return rejectWithValue(message);
    }
  }
);

// Replace guard
// store/slices/guardAssignmentSlice.ts

export const replaceGuard = createAsyncThunk<
  ReplaceGuardResponse, // Return type
  ReplaceGuardDto, // Argument type
  { rejectValue: string }
>(
  "guardAssignment/replaceGuard",
  async (data: ReplaceGuardDto, { rejectWithValue }) => {
    try {
      const response = await guardAssignmentService.replaceGuard(data);
      // The response is ApiResponse<ReplaceGuardResponse>
      // We need to return the body which contains the replacement data
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to replace guard";
      return rejectWithValue(message);
    }
  }
);

// Cancel assignment
export const cancelAssignment = createAsyncThunk(
  "guardAssignment/cancelAssignment",
  async (data: CancelAssignmentDto, { rejectWithValue }) => {
    try {
      const response = await guardAssignmentService.cancelAssignment(data);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to cancel guard assignment";
      return rejectWithValue(message);
    }
  }
);

// ------------------ Slice ------------------

const guardAssignmentSlice = createSlice({
  name: "guardAssignment",
  initialState,
  reducers: {
    clearAssignmentError: (state) => {
      state.error = null;
    },
    clearAssignmentSuccess: (state) => {
      state.successMessage = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    setAssignments: (state, action: PayloadAction<GuardAssignment[]>) => {
      state.assignments = action.payload;
    },
    updateAssignmentInList: (state, action: PayloadAction<GuardAssignment>) => {
      const index = state.assignments.findIndex(
        (assignment) => assignment.id === action.payload.id
      );
      if (index !== -1) {
        state.assignments[index] = action.payload;
      }
      if (state.currentAssignment?.id === action.payload.id) {
        state.currentAssignment = action.payload;
      }
    },
    removeAssignmentFromList: (state, action: PayloadAction<number>) => {
      state.assignments = state.assignments.filter(
        (assignment) => assignment.id !== action.payload
      );
      if (state.currentAssignment?.id === action.payload) {
        state.currentAssignment = null;
      }
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignments = action.payload.items;
        state.pagination = action.payload.data;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch single assignment
      .addCase(fetchAssignment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssignment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAssignment = action.payload.item;
      })
      .addCase(fetchAssignment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.assignments = [action.payload.item, ...state.assignments];
        state.currentAssignment = action.payload.item;
        state.pagination.total += 1;
        state.successMessage = "Guard assignment created successfully";
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Update assignment
      .addCase(updateAssignment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.assignments.findIndex(
          (assignment) => assignment.id === action.payload.item.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload.item;
        }
        if (state.currentAssignment?.id === action.payload.item.id) {
          state.currentAssignment = action.payload.item;
        }
        state.successMessage = "Guard assignment updated successfully";
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.assignments = state.assignments.filter(
          (assignment) => assignment.id !== action.payload
        );
        if (state.currentAssignment?.id === action.payload) {
          state.currentAssignment = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        state.successMessage = "Guard assignment deleted successfully";
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Update status
      .addCase(updateAssignmentStatus.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAssignmentStatus.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.assignments.findIndex(
          (assignment) => assignment.id === action.payload.item.id
        );
        if (index !== -1) {
          state.assignments[index] = action.payload.item;
        }
        if (state.currentAssignment?.id === action.payload.item.id) {
          state.currentAssignment = action.payload.item;
        }
        state.successMessage = "Status updated successfully";
      })
      .addCase(updateAssignmentStatus.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Bulk schedule
      .addCase(bulkScheduleAssignments.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(bulkScheduleAssignments.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.successMessage = `Bulk schedule completed: ${action.payload.summary.assignments_created} assignments created, ${action.payload.summary.assignments_skipped} skipped`;
      })
      .addCase(bulkScheduleAssignments.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })

      // Replace guard
      // .addCase(replaceGuard.pending, (state) => {
      //   state.isSubmitting = true;
      //   state.error = null;
      //   state.successMessage = null;
      // })
      // .addCase(replaceGuard.fulfilled, (state, action) => {
      //   state.isSubmitting = false;
      //   // The response contains the updated assignment
      //   const updatedAssignment = action.payload.item;
      //   const index = state.assignments.findIndex(
      //     (assignment) => assignment.id === updatedAssignment.id
      //   );
      //   if (index !== -1) {
      //     state.assignments[index] = updatedAssignment;
      //   }
      //   if (state.currentAssignment?.id === updatedAssignment.id) {
      //     state.currentAssignment = updatedAssignment;
      //   }
      //   state.successMessage = "Guard replaced successfully";
      // })
      // .addCase(replaceGuard.rejected, (state, action) => {
      //   state.isSubmitting = false;
      //   state.error = action.payload as string;
      // })

      // Replace guard
.addCase(replaceGuard.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(replaceGuard.fulfilled, (state, action) => {
        state.isSubmitting = false;
        // Now action.payload is ReplaceGuardResponse
        const data = action.payload;
        if (data && data.replaced && data.replaced.length > 0) {
          state.successMessage = `Guard replaced successfully: ${data.summary.assignments_replaced} assignment(s) replaced`;
        } else if (data && data.skipped && data.skipped.length > 0 && data.replaced.length === 0) {
          state.successMessage = `Guard replacement failed: ${data.skipped.length} assignment(s) skipped`;
        } else {
          state.successMessage = data?.message || "Guard replacement completed";
        }
      })
      .addCase(replaceGuard.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })


      // Cancel assignment
      .addCase(cancelAssignment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(cancelAssignment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const updatedAssignment = action.payload.item;
        const index = state.assignments.findIndex(
          (assignment) => assignment.id === updatedAssignment.id
        );
        if (index !== -1) {
          state.assignments[index] = updatedAssignment;
        }
        if (state.currentAssignment?.id === updatedAssignment.id) {
          state.currentAssignment = updatedAssignment;
        }
        state.successMessage = "Assignment cancelled successfully";
      })
      .addCase(cancelAssignment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearAssignmentError,
  clearAssignmentSuccess,
  clearCurrentAssignment,
  setAssignments,
  updateAssignmentInList,
  removeAssignmentFromList,
} = guardAssignmentSlice.actions;

export default guardAssignmentSlice.reducer;
