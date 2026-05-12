import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchQuiz, generateQuiz, submitQuiz, fetchResults } from "./quizApi";

export const getQuiz = createAsyncThunk("quiz/get",
  async (courseId, { rejectWithValue }) => {
    try { return (await fetchQuiz(courseId)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "No quiz found"); }
  }
);

export const generateCourseQuiz = createAsyncThunk("quiz/generate",
  async ({ courseId, numberOfQuestions }, { rejectWithValue }) => {
    try { return (await generateQuiz(courseId, { numberOfQuestions })).data.data.quiz; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Generation failed"); }
  }
);

export const submitQuizAttempt = createAsyncThunk("quiz/submit",
  async ({ courseId, answers }, { rejectWithValue }) => {
    try { return (await submitQuiz(courseId, { answers })).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Submission failed"); }
  }
);

export const getQuizResults = createAsyncThunk("quiz/results",
  async (courseId, { rejectWithValue }) => {
    try { return (await fetchResults(courseId)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    current:     null,   // quiz questions (no correct answers)
    result:      null,   // last submission result with review
    results:     null,   // all past attempts
    loading:     false,
    actionLoading: false,
    error:       null,
    success:     null,
  },
  reducers: {
    clearQuiz:     (s) => { s.current = null; s.result = null; s.error = null; s.success = null; },
    clearResult:   (s) => { s.result = null; },
  },
  extraReducers: (b) => {
    b
      .addCase(getQuiz.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(getQuiz.fulfilled, (s, { payload }) => { s.loading = false; s.current = payload; })
      .addCase(getQuiz.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

      .addCase(generateCourseQuiz.pending,   (s) => { s.actionLoading = true; s.error = null; s.success = null; })
      .addCase(generateCourseQuiz.fulfilled, (s, { payload }) => {
        s.actionLoading = false;
        s.success = `Quiz generated with ${payload.questions.length} questions!`;
      })
      .addCase(generateCourseQuiz.rejected,  (s, { payload }) => { s.actionLoading = false; s.error = payload; })

      .addCase(submitQuizAttempt.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(submitQuizAttempt.fulfilled, (s, { payload }) => { s.actionLoading = false; s.result = payload; })
      .addCase(submitQuizAttempt.rejected,  (s, { payload }) => { s.actionLoading = false; s.error = payload; })

      .addCase(getQuizResults.pending,   (s) => { s.loading = true; })
      .addCase(getQuizResults.fulfilled, (s, { payload }) => { s.loading = false; s.results = payload; })
      .addCase(getQuizResults.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; });
  },
});

export const { clearQuiz, clearResult } = quizSlice.actions;
export default quizSlice.reducer;