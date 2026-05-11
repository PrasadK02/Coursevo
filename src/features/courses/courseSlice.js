import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAllCourses, fetchCourseById, fetchMyCourses,
  createCourse, updateCourse, deleteCourse, addLesson,
  enrollInCourse, fetchMyEnrollments, updateProgress,
} from "./courseApi";

// ── Thunks ────────────────────────────────────────

export const getCourses = createAsyncThunk("courses/getAll",
  async (params, { rejectWithValue }) => {
    try { return (await fetchAllCourses(params)).data.data; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

export const getCourseById = createAsyncThunk("courses/getById",
  async (id, { rejectWithValue }) => {
    try { return (await fetchCourseById(id)).data.data.course; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

export const getMyCourses = createAsyncThunk("courses/getMy",
  async (_, { rejectWithValue }) => {
    try { return (await fetchMyCourses()).data.data.courses; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

export const createNewCourse = createAsyncThunk("courses/create",
  async (data, { rejectWithValue }) => {
    try { return (await createCourse(data)).data.data.course; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

export const updateExistingCourse = createAsyncThunk("courses/update",
  async ({ id, data }, { rejectWithValue }) => {
    try { return (await updateCourse(id, data)).data.data.course; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

export const deleteExistingCourse = createAsyncThunk("courses/delete",
  async (id, { rejectWithValue }) => {
    try { await deleteCourse(id); return id; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

export const addNewLesson = createAsyncThunk("courses/addLesson",
  async ({ courseId, data }, { rejectWithValue }) => {
    try { return { courseId, lesson: (await addLesson(courseId, data)).data.data.lesson }; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

export const enroll = createAsyncThunk("courses/enroll",
  async (courseId, { rejectWithValue }) => {
    try { return (await enrollInCourse(courseId)).data.data.enrollment; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Already enrolled or error"); }
  }
);

export const getMyEnrollments = createAsyncThunk("courses/getEnrollments",
  async (_, { rejectWithValue }) => {
    try { return (await fetchMyEnrollments()).data.data.enrollments; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

export const markLessonComplete = createAsyncThunk("courses/markLesson",
  async ({ courseId, lessonId }, { rejectWithValue }) => {
    try { return (await updateProgress(courseId, { lessonId })).data.data.enrollment; }
    catch (e) { return rejectWithValue(e.response?.data?.message || "Failed"); }
  }
);

// ── Slice ─────────────────────────────────────────

const courseSlice = createSlice({
  name: "courses",
  initialState: {
    list:        [],
    current:     null,
    myCourses:   [],
    enrollments: [],
    pagination:  {},
    loading:     false,
    actionLoading: false,
    error:       null,
    success:     null,
  },
  reducers: {
    clearMessages: (s) => { s.error = null; s.success = null; },
    clearCurrent:  (s) => { s.current = null; },
  },
  extraReducers: (b) => {
    const pending   = (s) => { s.loading = true;  s.error = null; };
    const rejected  = (s, { payload }) => { s.loading = false; s.error = payload; };

    b
      // getCourses
      .addCase(getCourses.pending,   pending)
      .addCase(getCourses.fulfilled, (s, { payload }) => {
        s.loading    = false;
        s.list       = payload.courses;
        s.pagination = payload.pagination;
      })
      .addCase(getCourses.rejected, rejected)

      // getCourseById
      .addCase(getCourseById.pending,   pending)
      .addCase(getCourseById.fulfilled, (s, { payload }) => { s.loading = false; s.current = payload; })
      .addCase(getCourseById.rejected,  rejected)

      // getMyCourses
      .addCase(getMyCourses.pending,   pending)
      .addCase(getMyCourses.fulfilled, (s, { payload }) => { s.loading = false; s.myCourses = payload; })
      .addCase(getMyCourses.rejected,  rejected)

      // createNewCourse
      .addCase(createNewCourse.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(createNewCourse.fulfilled, (s, { payload }) => {
        s.actionLoading = false;
        s.myCourses.unshift(payload);
        s.success = "Course created successfully!";
      })
      .addCase(createNewCourse.rejected, (s, { payload }) => { s.actionLoading = false; s.error = payload; })

      // updateExistingCourse
      .addCase(updateExistingCourse.fulfilled, (s, { payload }) => {
        s.actionLoading = false;
        const idx = s.myCourses.findIndex((c) => c._id === payload._id);
        if (idx >= 0) s.myCourses[idx] = payload;
        s.success = "Course updated!";
      })

      // deleteExistingCourse
      .addCase(deleteExistingCourse.fulfilled, (s, { payload }) => {
        s.myCourses = s.myCourses.filter((c) => c._id !== payload);
        s.success   = "Course deleted";
      })

      // addNewLesson
      .addCase(addNewLesson.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(addNewLesson.fulfilled, (s, { payload }) => {
        s.actionLoading = false;
        if (s.current?._id === payload.courseId) {
          s.current.lessons = [...(s.current.lessons || []), payload.lesson];
        }
        s.success = "Lesson added!";
      })
      .addCase(addNewLesson.rejected, (s, { payload }) => { s.actionLoading = false; s.error = payload; })

      // enroll
      .addCase(enroll.pending,   (s) => { s.actionLoading = true; s.error = null; })
      .addCase(enroll.fulfilled, (s, { payload }) => {
        s.actionLoading = false;
        s.enrollments.push(payload);
        s.success = "Enrolled successfully!";
      })
      .addCase(enroll.rejected, (s, { payload }) => { s.actionLoading = false; s.error = payload; })

      // getMyEnrollments
      .addCase(getMyEnrollments.pending,   pending)
      .addCase(getMyEnrollments.fulfilled, (s, { payload }) => { s.loading = false; s.enrollments = payload; })
      .addCase(getMyEnrollments.rejected,  rejected)

      // markLessonComplete
      .addCase(markLessonComplete.fulfilled, (s, { payload }) => {
        const idx = s.enrollments.findIndex((e) => e.course?._id === payload.course);
        if (idx >= 0) s.enrollments[idx] = { ...s.enrollments[idx], ...payload };
      });
  },
});

export const { clearMessages, clearCurrent } = courseSlice.actions;
export default courseSlice.reducer;