import { configureStore } from '@reduxjs/toolkit'
import fileTreeReducer from './slices/fileTreeSlice'
import ingestionReducer from './slices/ingestionSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    fileTree: fileTreeReducer,
    ingestion: ingestionReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
