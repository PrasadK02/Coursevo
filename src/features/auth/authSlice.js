import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { registerUser, loginUser, getMe } from "./authApi";

// ── Thunks ────────────────────────────────────────────────────────

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await registerUser(userData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await loginUser(userData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMe();
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch user");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────

// LocalStorage se initial state load karo (page refresh pe login bana rahe)
const token = localStorage.getItem("token");
const user  = JSON.parse(localStorage.getItem("user") || "null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    user  || null,
    token:   token || null,
    loading: false,
    error:   null,
  },
  reducers: {
    logout: (state) => {
      state.user  = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(register.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token   = payload.token;
        s.user    = payload.user;
        localStorage.setItem("token", payload.token);
        localStorage.setItem("user",  JSON.stringify(payload.user));
      })
      .addCase(register.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

    // Login
      .addCase(login.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(login.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token   = payload.token;
        s.user    = payload.user;
        localStorage.setItem("token", payload.token);
        localStorage.setItem("user",  JSON.stringify(payload.user));
      })
      .addCase(login.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

    // Fetch Me
      .addCase(fetchMe.fulfilled, (s, { payload }) => { s.user = payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;