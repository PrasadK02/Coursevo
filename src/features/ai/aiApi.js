import api from "../../utils/axios";

export const askQuestion = (data) => api.post("/ai/chat", data);