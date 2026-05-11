import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../features/auth/authSlice";

export default function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loading, error, token } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const from = location.state?.from?.pathname || "/";
  useEffect(() => { if (token) navigate(from, { replace: true }); }, [token]);
  useEffect(() => () => dispatch(clearError()), []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); dispatch(login(form)); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      {/* Background decoration */}
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0,
      }}>
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(104,186,127,0.06) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", left: "-10%",
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(104,186,127,0.04) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}
        className="stagger">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52,
            background: "var(--accent)",
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 30px rgba(104,186,127,0.3)",
          }}>
            <i className="fa-solid fa-leaf" style={{ color: "var(--text-inverse)", fontSize: 22 }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            Sign in to continue learning
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-surface)",
          border:     "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: 32,
          boxShadow: "var(--shadow-lg)",
        }}>

          {error && (
            <div className="alert-error" style={{ marginBottom: 20 }}>
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Email */}
              <div>
                <label className="label">Email address</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: 13,
                  }} />
                  <input
                    className="input" type="email" name="email"
                    value={form.email} onChange={handleChange} required
                    placeholder="you@example.com"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-lock" style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: 13,
                  }} />
                  <input
                    className="input" type={showPass ? "text" : "password"}
                    name="password" value={form.password} onChange={handleChange} required
                    placeholder="Enter your password"
                    style={{ paddingLeft: 40, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass((v) => !v)} style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: 0,
                  }}>
                    <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} style={{ fontSize: 13 }} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: "100%", padding: "12px 0", fontSize: 15, marginTop: 4 }}>
                {loading ? (
                  <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in...</>
                ) : (
                  <><i className="fa-solid fa-arrow-right-to-bracket" /> Sign in</>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <hr className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>QUICK TEST</span>
            <hr className="divider" style={{ flex: 1 }} />
          </div>

          {/* Test credentials */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Student",    icon: "fa-graduation-cap", email: "student@test.com" },
              { label: "Instructor", icon: "fa-chalkboard-user", email: "instructor@test.com" },
            ].map(({ label, icon, email }) => (
              <button key={label} type="button"
                onClick={() => setForm({ email, password: "123456" })}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  padding: "12px 8px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "Montserrat, sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
              >
                <i className={`fa-solid ${icon}`} style={{ fontSize: 18, color: "var(--accent)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>test@test.com</span>
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 20 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}