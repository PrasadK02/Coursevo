import { configureStore }  from "@reduxjs/toolkit";
import authReducer   from "../features/auth/authSlice";
import courseReducer from "../features/courses/courseSlice";
import aiReducer     from "../features/ai/aiSlice";
import quizReducer   from "../features/quiz/quizSlice";

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    courses: courseReducer,
    ai:      aiReducer,
    quiz:    quizReducer,
  },
});