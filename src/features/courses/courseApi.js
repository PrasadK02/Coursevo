import api from "../../utils/axios";

export const fetchAllCourses    = (params)           => api.get("/courses", { params });
export const fetchCourseById    = (id)               => api.get(`/courses/${id}`);
export const fetchMyCourses     = ()                 => api.get("/courses/my");
export const createCourse       = (data)             => api.post("/courses", data);
export const updateCourse       = (id, data)         => api.put(`/courses/${id}`, data);
export const deleteCourse       = (id)               => api.delete(`/courses/${id}`);
export const addLesson          = (id, data)         => api.post(`/courses/${id}/lessons`, data);
export const enrollInCourse     = (courseId)         => api.post(`/enrollments/${courseId}`);
export const fetchMyEnrollments = ()                 => api.get("/enrollments/my");
export const updateProgress     = (courseId, data)   => api.put(`/enrollments/${courseId}/progress`, data);
export const fetchCourseStudents= (courseId)         => api.get(`/enrollments/${courseId}/students`);