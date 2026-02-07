import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import clientReducer from './slices/clientSlice';
import guardReducer from './slices/guardSlice'
import contactReducer from './slices/contactSlice'
import siteReducer from './slices/siteSlice'
import siteLocationReducer from './slices/siteLocationSlice'
import dutyTimeTypesReducer from './slices/dutyTimeTypesSlice'
import dutyReducer from './slices/dutySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    client: clientReducer,
    guard: guardReducer,
    contact:contactReducer,
    site:siteReducer,
    siteLocation:siteLocationReducer,
    dutyTimeTypes:dutyTimeTypesReducer,
    duty:dutyReducer
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