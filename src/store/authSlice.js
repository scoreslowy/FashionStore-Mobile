import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isAuthenticated: false, isHydrated: false },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isHydrated = true;
    },
    restoreAuth: (state, action) => {
      state.user = action.payload || null;
      state.isAuthenticated = Boolean(action.payload);
      state.isHydrated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isHydrated = true;
    },
  },
});

export const { login, restoreAuth, logout } = authSlice.actions;
export default authSlice.reducer;
