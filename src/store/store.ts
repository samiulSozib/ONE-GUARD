import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import clientReducer from './slices/clientSlice';
import guardReducer from './slices/guardSlice'
import contactReducer from './slices/contactSlice'
import siteReducer from './slices/siteSlice'
import siteLocationReducer from './slices/siteLocationSlice'
import dutyTimeTypesReducer from './slices/dutyTimeTypesSlice'
import dutyReducer from './slices/dutySlice'
import guardAssignmentReducer from './slices/guardAssignmentSlice'
import dutyStatusReportReducer from './slices/dutyStatusReportSlice'
import dutyAttendanceReducer from './slices/dutyAttendenceSlice'
import guardTypesReducer from './slices/guardTypeSlice'
import expenseCategoryReducer from './slices/expenseCategorySlice'
import complaintReducer from './slices/complaintSlice'
import expenseReducer from './slices/expenseSlice'
import leaveReducer from './slices/leaveSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    client: clientReducer,
    guard: guardReducer,
    contact:contactReducer,
    site:siteReducer,
    siteLocation:siteLocationReducer,
    dutyTimeTypes:dutyTimeTypesReducer,
    duty:dutyReducer,
    guardAssignment:guardAssignmentReducer,
    dutyStatusReport:dutyStatusReportReducer,
    dutyAttendance:dutyAttendanceReducer,
    guardTypes:guardTypesReducer,
    expenseCategory:expenseCategoryReducer,
    complaint:complaintReducer,
    expense:expenseReducer,
    leave:leaveReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['client/getClients/fulfilled'],
        ignoredPaths: ['client.currentClient'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;