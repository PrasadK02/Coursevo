import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

export default function Navbar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, token } = useSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next === "light" ? "light" : "");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = token ? (
    user?.role === "instructor"
      ? [
          { to: "/",                       icon: "fa-compass",    label: "Explore" },
          { to: "/instructor/dashboard",   icon: "fa-gauge",      label: "Dashboard" },
          { to: "/instructor/courses",     icon: "fa-book-open",  label: "My Courses" },
        ]
      : [
          { to: "/",                       icon: "fa-compass",    label: "Explore" },
          { to: "/my-courses",             icon: "fa-graduation-cap", label: "My Learning" },
        ]
  ) : [
    { to: "/", icon: "fa-compass", label: "Explore" },
  ];

  return (
    <>
      <nav style={{
        background:   "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        position:     "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "var(--shadow-md)",
      }}>
        <div className="container-app">
          <div style={{ display: "flex", alignItems: "center", height: 64, gap: 32 }}>

            {/* Logo */}
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36,
                background: "var(--accent)",
                borderRadius: "var(--radius-md)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "var(--shadow-accent)",
              }}>
                <i className="fa-solid fa-leaf" style={{ color: "var(--text-inverse)", fontSize: 16 }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                Course<span style={{ color: "var(--accent)" }}>vo</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 4, flex: 1 }}>
              {navLinks.map(({ to, icon, label }) => (
                <Link key={to} to={to} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 14px",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.15s",
                  background:   isActive(to) ? "var(--accent-dim)" : "transparent",
                  color:        isActive(to) ? "var(--accent)" : "var(--text-secondary)",
                  borderBottom: isActive(to) ? "2px solid var(--accent)" : "2px solid transparent",
                }}>
                  <i className={`fa-solid ${icon}`} style={{ fontSize: 12 }} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>

              {/* Theme toggle */}
              <button onClick={toggleTheme} style={{
                width: 36, height: 36,
                background: "var(--bg-elevated)",
                border:     "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-secondary)",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
              >
                <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} style={{ fontSize: 13 }} />
              </button>

              {!token ? (
                <>
                  <Link to="/login" className="btn-ghost" style={{ fontSize: 13 }}>Sign in</Link>
                  <Link to="/register" className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
                    Get started
                  </Link>
                </>
              ) : (
                <div style={{ position: "relative" }}>
                  <button onClick={() => setMenuOpen((v) => !v)} style={{
                    display: "flex", alignItems: "center", gap: 9,
                    background: menuOpen ? "var(--accent-dim)" : "var(--bg-elevated)",
                    border:     `1px solid ${menuOpen ? "var(--accent-border)" : "var(--border-strong)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "6px 12px 6px 8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 28, height: 28,
                      background: "var(--accent)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "var(--text-inverse)", fontWeight: 700, fontSize: 12 }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ textAlign: "left" }} className="hidden md:block">
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                        {user?.name?.split(" ")[0]}
                      </p>
                      <p style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600, textTransform: "capitalize" }}>
                        {user?.role}
                      </p>
                    </div>
                    <i className={`fa-solid fa-chevron-${menuOpen ? "up" : "down"}`}
                      style={{ fontSize: 10, color: "var(--text-muted)" }} />
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      background: "var(--bg-elevated)",
                      border:     "1px solid var(--border-strong)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow: "var(--shadow-lg)",
                      minWidth: 180,
                      overflow: "hidden",
                      animation: "fadeUp 0.15s ease",
                    }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{user?.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{user?.email}</p>
                      </div>
                      <div style={{ padding: 6 }}>
                        {navLinks.map(({ to, icon, label }) => (
                          <Link key={to} to={to}
                            onClick={() => setMenuOpen(false)}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "9px 12px",
                              borderRadius: "var(--radius-md)",
                              textDecoration: "none",
                              fontSize: 13, fontWeight: 600,
                              color: "var(--text-secondary)",
                              transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-dim)"; e.currentTarget.style.color = "var(--accent)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                          >
                            <i className={`fa-solid ${icon}`} style={{ fontSize: 12, width: 14 }} />
                            {label}
                          </Link>
                        ))}
                        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "6px 0" }} />
                        <button onClick={handleLogout} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 12px", width: "100%",
                          borderRadius: "var(--radius-md)",
                          background: "transparent", border: "none",
                          fontSize: 13, fontWeight: 600,
                          color: "var(--error)",
                          cursor: "pointer", transition: "all 0.15s",
                          fontFamily: "Montserrat, sans-serif",
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 12, width: 14 }} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden" style={{
                width: 36, height: 36,
                background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-secondary)",
              }}>
                <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} style={{ fontSize: 14 }} />
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Click outside to close */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99 }} />
      )}
    </>
  );
}