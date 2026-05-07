import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Phase F2 mein add honge: courses, enrollments
    // Phase F3 mein add honge: ai, quiz
  },
});