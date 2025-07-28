import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getS3Tree as apiFetchTree, createFolder as apiCreateFolder, deleteItem as apiDeleteItem, deleteFile as apiDeleteFile } from '@/api'

// Helper function to inject paths into tree nodes
const injectPaths = (node, parentPath = "") => {
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name
  return {
    ...node,
    path: currentPath,
    children: Array.isArray(node.children) ? node.children.map((child) => injectPaths(child, currentPath)) : [],
  }
}

// Async thunks
export const fetchTreeData = createAsyncThunk(
  'fileTree/fetchTreeData',
  async (_, { rejectWithValue }) => {
    try {
      const rawTree = await apiFetchTree()
      const treeWithPaths = rawTree.map((node) => injectPaths(node, ""))
      return treeWithPaths
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createFolder = createAsyncThunk(
  'fileTree/createFolder',
  async ({ path, userId, userRole }, { dispatch, rejectWithValue }) => {
    try {
      await apiCreateFolder(path, userId, userRole)
      // Refresh tree and ingestion data after folder creation
      dispatch(fetchTreeData())
      dispatch({ type: 'ingestion/refreshData' })
      return path
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteFileOrFolder = createAsyncThunk(
  'fileTree/deleteFileOrFolder',
  async ({ path, userId, userRole }, { dispatch, rejectWithValue }) => {
    try {
      // Check if the path is a file (has an extension) or folder
      const isFile = path.includes('.') && !path.endsWith('/')
      
      if (isFile) {
        // Use the specific deleteFile API for files
        await apiDeleteFile(path, userId, userRole)
      } else {
        // Use the generic deleteItem API for folders
        await apiDeleteItem(path)
      }
      
      // Refresh tree and ingestion data after deletion
      dispatch(fetchTreeData())
      dispatch({ type: 'ingestion/refreshData' })
      return { path, isFile }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const fileTreeSlice = createSlice({
  name: 'fileTree',
  initialState: {
    treeData: [],
    loading: false,
    error: null,
    selectedItem: null,
    breadcrumb: [],
  },
  reducers: {
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload
      if (action.payload) {
        state.breadcrumb = action.payload.split('/').filter(Boolean)
      } else {
        state.breadcrumb = []
      }
    },
    clearError: (state) => {
      state.error = null
    },
    // Action to trigger refresh from other parts of the app
    triggerRefresh: (state) => {
      // This will be handled by extraReducers
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tree data
      .addCase(fetchTreeData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTreeData.fulfilled, (state, action) => {
        state.loading = false
        state.treeData = action.payload
      })
      .addCase(fetchTreeData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create folder
      .addCase(createFolder.pending, (state) => {
        state.loading = true
      })
      .addCase(createFolder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete item
      .addCase(deleteFileOrFolder.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteFileOrFolder.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteFileOrFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Handle refresh trigger from other slices
      .addMatcher(
        (action) => action.type.endsWith('/refreshFileTree'),
        (state) => {
          // This will trigger a refresh in components that listen to this action
        }
      )
  },
})

export const { setSelectedItem, clearError, triggerRefresh } = fileTreeSlice.actions
export default fileTreeSlice.reducer
