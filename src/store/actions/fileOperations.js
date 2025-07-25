import { createAsyncThunk } from '@reduxjs/toolkit'
import { createFile as apiCreateFile, uploadFile as apiUploadFile, renameFile as apiRenameFile } from '@/api'
import { fetchTreeData } from '../slices/fileTreeSlice'
import { fetchIngestionData } from '../slices/ingestionSlice'

// File operations that trigger both tree and ingestion refresh
export const createFileWithRefresh = createAsyncThunk(
  'fileOperations/createFile',
  async ({ path, userId, userRole }, { dispatch, rejectWithValue }) => {
    try {
      const result = await apiCreateFile(path, userId, userRole)
      
      // Automatically refresh both tree and ingestion data
      dispatch(fetchTreeData())
      dispatch(fetchIngestionData())
      
      return { path, result }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const uploadFileWithRefresh = createAsyncThunk(
  'fileOperations/uploadFile',
  async ({ parentPath, file, userId, userRole }, { dispatch, rejectWithValue }) => {
    try {
      const result = await apiUploadFile(parentPath, file, userId, userRole)
      
      // Automatically refresh both tree and ingestion data
      dispatch(fetchTreeData())
      dispatch(fetchIngestionData())
      
      return { parentPath, fileName: file.name, result }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const renameFileWithRefresh = createAsyncThunk(
  'fileOperations/renameFile',
  async ({ oldPath, newPath, userId, userRole }, { dispatch, rejectWithValue }) => {
    try {
      const result = await apiRenameFile(oldPath, newPath, userId, userRole)
      
      // Automatically refresh both tree and ingestion data
      dispatch(fetchTreeData())
      dispatch(fetchIngestionData())
      
      return { oldPath, newPath, result }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
