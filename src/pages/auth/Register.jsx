import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../../features/auth/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (token) navigate("/"); }, [token]);
  useEffect(() => () => dispatch(clearError()), []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); dispatch(register(form)); };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: "-15%", left: "-5%",
          width: 450, height: 450, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(104,186,127,0.07) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 460 }}
        className="stagger">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, background: "var(--accent)", borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 30px rgba(104,186,127,0.3)",
          }}>
            <i className="fa-solid fa-leaf" style={{ color: "var(--text-inverse)", fontSize: 22 }} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Join Coursevo
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            Start your learning journey today
          </p>
        </div>

        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: 32, boxShadow: "var(--shadow-lg)",
        }}>

          {error && (
            <div className="alert-error" style={{ marginBottom: 20 }}>
              <i className="fa-solid fa-circle-exclamation" /> {error}
            </div>
          )}

          {/* Role selector — top */}
          <div style={{ marginBottom: 24 }}>
            <label className="label">I want to</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { value: "student",    icon: "fa-graduation-cap", label: "Learn",  desc: "Enroll in courses" },
                { value: "instructor", icon: "fa-chalkboard-user", label: "Teach", desc: "Create & sell courses" },
              ].map(({ value, icon, label, desc }) => (
                <label key={value} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 6, padding: 16,
                  border:  `2px solid ${form.role === value ? "var(--accent)" : "var(--border-strong)"}`,
                  borderRadius: "var(--radius-lg)",
                  background: form.role === value ? "var(--accent-dim)" : "var(--bg-elevated)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  <input type="radio" name="role" value={value}
                    checked={form.role === value} onChange={handleChange}
                    style={{ display: "none" }} />
                  <div style={{
                    width: 38, height: 38,
                    background: form.role === value ? "var(--accent)" : "var(--bg-surface)",
                    borderRadius: "var(--radius-md)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    <i className={`fa-solid ${icon}`} style={{
                      fontSize: 16,
                      color: form.role === value ? "var(--text-inverse)" : "var(--text-muted)",
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{label}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>{desc}</span>
                  {form.role === value && (
                    <span style={{ position: "absolute" }} />
                  )}
                </label>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Name */}
              <div>
                <label className="label">Full name</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-user" style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: 13,
                  }} />
                  <input className="input" type="text" name="name"
                    value={form.name} onChange={handleChange} required
                    placeholder="John Doe" style={{ paddingLeft: 40 }} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="label">Email address</label>
                <div style={{ position: "relative" }}>
                  <i className="fa-solid fa-envelope" style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    color: "var(--text-muted)", fontSize: 13,
                  }} />
                  <input className="input" type="email" name="email"
                    value={form.email} onChange={handleChange} required
                    placeholder="you@example.com" style={{ paddingLeft: 40 }} />
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
                  <input className="input" type={showPass ? "text" : "password"}
                    name="password" value={form.password} onChange={handleChange} required
                    placeholder="Min. 6 characters"
                    style={{ paddingLeft: 40, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass((v) => !v)} style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: 0,
                  }}>
                    <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} style={{ fontSize: 13 }} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary"
                style={{ width: "100%", padding: "12px 0", fontSize: 15, marginTop: 4 }}>
                {loading ? (
                  <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</>
                ) : (
                  <><i className="fa-solid fa-rocket" /> Create account</>
                )}
              </button>

            </div>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 20 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}