import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyEnrollments } from "../../features/courses/courseSlice";

export default function MyCourses() {
  const dispatch = useDispatch();
  const { enrollments, loading, error } = useSelector((s) => s.courses);

useEffect(() => {
  console.log("MyCourses mounted — dispatching getMyEnrollments");
  dispatch(getMyEnrollments());
}, [dispatch]);

  // Debug — console mein dekho kya aa raha hai
  console.log("Enrollments:", enrollments);

  return (
    <div className="page">
      <div className="container-app" style={{ padding: "40px 24px" }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            <i className="fa-solid fa-graduation-cap" style={{ color: "var(--accent)", marginRight: 12 }} />
            My Learning
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>

        {/* Error state */}
        {error && (
          <div className="alert-error" style={{ marginBottom: 20 }}>
            <i className="fa-solid fa-circle-exclamation" /> {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 18, width: "90%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 8, width: "100%", borderRadius: 4 }} />
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{
              width: 80, height: 80, background: "var(--bg-elevated)",
              borderRadius: "var(--radius-xl)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <i className="fa-solid fa-book-open" style={{ fontSize: 32, color: "var(--text-muted)" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              No courses yet
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
              Explore courses and start learning today
            </p>
            <Link to="/" className="btn-primary">
              <i className="fa-solid fa-compass" /> Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }} className="stagger">
            {enrollments.map((enrollment) => {
              // ── Safe access — course null ho sakta hai ──
              const course = enrollment.course;
              const pct    = enrollment.completionPercent || 0;

              // Agar course null hai to skip
              if (!course || typeof course === "string") {
                return (
                  <div key={enrollment._id} style={{
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)", padding: 20,
                  }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6, color: "var(--warning)" }} />
                      Course data unavailable
                    </p>
                  </div>
                );
              }

              const courseId = course._id || course;

              return (
                <div key={enrollment._id} className="card" style={{ padding: 0, overflow: "hidden" }}>

                  {/* Top progress strip */}
                  <div style={{ height: 4, background: "var(--bg-elevated)", position: "relative" }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: `${pct}%`,
                      background: "var(--accent)",
                      transition: "width 0.5s ease",
                    }} />
                  </div>

                  <div style={{ padding: 20 }}>
                    {/* Course info */}
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} style={{
                          width: 56, height: 56, borderRadius: "var(--radius-md)",
                          objectFit: "cover", flexShrink: 0,
                        }} />
                      ) : (
                        <div style={{
                          width: 56, height: 56, borderRadius: "var(--radius-md)",
                          background: "var(--bg-elevated)", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1px solid var(--border)",
                        }}>
                          <i className="fa-solid fa-book" style={{ fontSize: 20, color: "var(--text-muted)" }} />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontSize: 14, fontWeight: 700, color: "var(--text-primary)",
                          marginBottom: 4, lineHeight: 1.4,
                          overflow: "hidden", textOverflow: "ellipsis",
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                          {course.title}
                        </h3>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {course.instructor?.name || "Instructor"}
                        </p>
                        <span className="badge" style={{ marginTop: 4, fontSize: 10 }}>
                          {course.level || "beginner"}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
                          Progress
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700,
                          color: pct === 100 ? "var(--accent)" : "var(--text-secondary)",
                        }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: "var(--accent)",
                          borderRadius: 3, transition: "width 0.5s ease",
                          opacity: pct === 0 ? 0.4 : 1,
                        }} />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{
                      display: "flex", gap: 12, marginBottom: 16,
                      paddingBottom: 12, borderBottom: "1px solid var(--border)",
                    }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        <i className="fa-solid fa-book" style={{ color: "var(--accent)", marginRight: 4 }} />
                        {course.lessons?.length || 0} lessons
                      </span>
                      {enrollment.isCompleted && (
                        <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
                          <i className="fa-solid fa-trophy" style={{ marginRight: 4 }} />
                          Completed!
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link to={`/courses/${courseId}`} className="btn-primary"
                        style={{ flex: 1, padding: "9px 0", fontSize: 13, justifyContent: "center" }}>
                        <i className={`fa-solid ${pct === 0 ? "fa-play" : pct === 100 ? "fa-rotate-right" : "fa-forward"}`} />
                        {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
                      </Link>
                      <Link to={`/courses/${courseId}/chat`}
                        style={{
                          width: 36, height: 36, borderRadius: "var(--radius-md)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
                          color: "var(--accent)", textDecoration: "none", transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                        title="Ask AI Tutor"
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-dim)"; e.currentTarget.style.borderColor = "var(--accent-border)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                      >
                        <i className="fa-solid fa-robot" style={{ fontSize: 13 }} />
                      </Link>
                      <Link to={`/courses/${courseId}/quiz`}
                        style={{
                          width: 36, height: 36, borderRadius: "var(--radius-md)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "var(--bg-elevated)", border: "1px solid var(--border-strong)",
                          color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.15s",
                          flexShrink: 0,
                        }}
                        title="Take Quiz"
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-dim)"; e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                      >
                        <i className="fa-solid fa-circle-question" style={{ fontSize: 13 }} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}