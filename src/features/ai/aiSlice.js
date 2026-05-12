import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { askQuestion } from "./aiApi";

export const sendAiMessage = createAsyncThunk(
  "ai/sendMessage",
  async ({ courseId, question }, { rejectWithValue }) => {
    try {
      const res = await askQuestion({ courseId, question });
      return res.data.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || "AI service unavailable");
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    messages:  {},    // { [courseId]: [{role, text, time}] }
    loading:   false,
    error:     null,
  },
  reducers: {
    clearChat: (s, { payload: courseId }) => { s.messages[courseId] = []; },
  },
  extraReducers: (b) => {
    b
      .addCase(sendAiMessage.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(sendAiMessage.fulfilled, (s, { payload, meta }) => {
        s.loading = false;
        const cid = meta.arg.courseId;
        if (!s.messages[cid]) s.messages[cid] = [];
        s.messages[cid].push(
          { role: "user",      text: meta.arg.question, time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
          { role: "assistant", text: payload.answer,    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) }
        );
      })
      .addCase(sendAiMessage.rejected, (s, { payload }) => {
        s.loading = false;
        s.error   = payload;
      });
  },
});

export const { clearChat } = aiSlice.actions;
export default aiSlice.reducer;