import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchMe } from "../features/auth/authSlice";
import Navbar from "../components/NavBar";
import ProtectedRoute from "../components/ProtectedRoute";
// Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Placeholder pages — Phase F2 mein replace honge
const Home       = () => <div className="p-8 text-center text-gray-500">Home — Phase F2 mein banega</div>;
const MyCourses  = () => <div className="p-8 text-center text-gray-500">My Courses — Phase F2 mein banega</div>;
const Dashboard  = () => <div className="p-8 text-center text-gray-500">Instructor Dashboard — Phase F2 mein banega</div>;

export default function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  // App load hone pe user data refresh karo
  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student protected routes */}
        <Route path="/my-courses" element={
          <ProtectedRoute role="student"><MyCourses /></ProtectedRoute>
        } />

        {/* Instructor protected routes */}
        <Route path="/instructor/dashboard" element={
          <ProtectedRoute role="instructor"><Dashboard /></ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}