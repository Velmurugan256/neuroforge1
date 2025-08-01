import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchRecentActivity, neuroSync, neuroWipe, fileStatus } from '@/api'

const LIMIT = 25

// Async thunks
export const fetchIngestionData = createAsyncThunk(
  'ingestion/fetchIngestionData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchRecentActivity(LIMIT)
      
      if (data?.stats) {
        return {
          stats: data.stats,
          activity: data.activity || []
        }
      } else if (Array.isArray(data)) {
        const stats = {
          totalUploaded: data.length,
          learned: data.filter((d) => d.status === "learned").length,
          failed: data.filter((d) => d.status === "failed").length,
          lastUpload: data[0]?.last_modified ?? "—",
          lastFailed: data.find((d) => d.status === "failed")?.last_modified ?? "—",
        }
        return {
          stats,
          activity: data
        }
      }
      
      return { stats: null, activity: [] }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const performNeuroSync = createAsyncThunk(
  'ingestion/performNeuroSync',
  async (targets, { dispatch, rejectWithValue }) => {
    try {
      const result = await neuroSync(targets)
      // Refresh ingestion data after sync
      dispatch(fetchIngestionData())
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const performNeuroWipe = createAsyncThunk(
  'ingestion/performNeuroWipe',
  async (targets, { dispatch, rejectWithValue }) => {
    try {
      const result = await neuroWipe(targets)
      // Refresh ingestion data after wipe
      dispatch(fetchIngestionData())
      return result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const ingestionSlice = createSlice({
  name: 'ingestion',
  initialState: {
    stats: null,
    activity: [],
    loading: false,
    error: null,
    syncing: false,
    wiping: false,
    syncTargets: [],
    wipeTargets: [],
    refreshTick: 0,
  },
  reducers: {
    setSyncTargets: (state, action) => {
      state.syncTargets = action.payload
    },
    setWipeTargets: (state, action) => {
      state.wipeTargets = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    // Manual refresh trigger
    refreshData: (state) => {
      state.refreshTick += 1
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch ingestion data
      .addCase(fetchIngestionData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchIngestionData.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.stats
        state.activity = action.payload.activity
      })
      .addCase(fetchIngestionData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Neuro sync
      .addCase(performNeuroSync.pending, (state) => {
        state.syncing = true
      })
      .addCase(performNeuroSync.fulfilled, (state) => {
        state.syncing = false
      })
      .addCase(performNeuroSync.rejected, (state, action) => {
        state.syncing = false
        state.error = action.payload
      })
      // Neuro wipe
      .addCase(performNeuroWipe.pending, (state) => {
        state.wiping = true
      })
      .addCase(performNeuroWipe.fulfilled, (state) => {
        state.wiping = false
      })
      .addCase(performNeuroWipe.rejected, (state, action) => {
        state.wiping = false
        state.error = action.payload
      })
      // Listen for actions from other slices that should trigger refresh
      .addMatcher(
        (action) => 
          action.type.includes('fileTree/createFolder/fulfilled') ||
          action.type.includes('fileTree/deleteFileOrFolder/fulfilled') ||
          action.type.endsWith('/uploadFile/fulfilled') ||
          action.type.endsWith('/createFile/fulfilled') ||
          action.type.endsWith('/renameFile/fulfilled') ||
          action.type.endsWith('/renameItem/fulfilled'),
        (state) => {
          state.refreshTick += 1
        }
      )
  },
})

export const { setSyncTargets, setWipeTargets, clearError, refreshData } = ingestionSlice.actions
export default ingestionSlice.reducer
