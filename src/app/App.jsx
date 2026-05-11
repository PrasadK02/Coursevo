import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMe } from "../features/auth/authSlice";
import Navbar from "../components/common/Navbar"
import ProtectedRoute from "../components/common/ProtectedRoute";

import Login       from "../pages/auth/Login";
import Register    from "../pages/auth/Register";
import Home        from "../pages/home/Home";
import CourseDetail from "../pages/courses/CourseDetail";
import MyCourses   from "../pages/courses/MyCourses";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import CreateCourse        from "../pages/instructor/CreateCourse";
import AddLesson           from "../pages/instructor/AddLesson";

export default function App() {
  const dispatch  = useDispatch();
  const { token } = useSelector((s) => s.auth);

  useEffect(() => { if (token) dispatch(fetchMe()); }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"            element={<Home />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />

        {/* Student */}
        <Route path="/my-courses" element={
          <ProtectedRoute role="student"><MyCourses /></ProtectedRoute>
        } />

        {/* Instructor */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute>
        } />
        <Route path="/instructor/create-course" element={
          <ProtectedRoute role="instructor"><CreateCourse /></ProtectedRoute>
        } />
        <Route path="/instructor/courses/:id/add-lesson" element={
          <ProtectedRoute role="instructor"><AddLesson /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}