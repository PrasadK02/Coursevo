import api from "../../utils/axios";

export const fetchQuiz      = (courseId)        => api.get(`/quizzes/${courseId}`);
export const generateQuiz   = (courseId, data)  => api.post(`/quizzes/generate/${courseId}`, data);
export const submitQuiz     = (courseId, data)  => api.post(`/quizzes/${courseId}/attempt`, data);
export const fetchResults   = (courseId)        => api.get(`/quizzes/${courseId}/results`);