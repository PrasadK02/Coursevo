import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCourseById, enroll, clearMessages } from "../../features/courses/courseSlice";

export default function CourseDetail() {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { current: course, loading, actionLoading, error, success, enrollments } =
    useSelector((s) => s.courses);
  const { user, token } = useSelector((s) => s.auth);

  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    dispatch(getCourseById(id));
    return () => dispatch(clearMessages());
  }, [id, dispatch]);

  useEffect(() => {
    if (course?.lessons?.length > 0) setActiveLesson(course.lessons[0]);
  }, [course]);

  const isEnrolled   = enrollments.some((e) => e.course?._id === id || e.course === id);
  const isInstructor = user?.role === "instructor";

  const handleEnroll = () => {
    if (!token) { navigate("/login"); return; }
    dispatch(enroll(id));
  };

  if (loading || !course) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p style={{ color: "var(--text-muted)", marginTop: 16, fontSize: 14 }}>Loading course...</p>
      </div>
    </div>
  );

  return (
    <div className="page">

      {/* ── Top banner ── */}
      <div style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)", padding: "32px 24px" }}>
        <div className="container-app">
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 280 }} className="stagger">
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                <span className="badge">{course.level}</span>
                {course.category && (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{course.category}</span>
                )}
              </div>

              <h1 style={{ fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 12 }}>
                {course.title}
              </h1>

              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                {course.description}
              </p>

              {/* Instructor row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-inverse)" }}>
                    {course.instructor?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{course.instructor?.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Instructor</p>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { icon: "fa-users",  val: `${course.enrollmentCount || 0} students` },
                  { icon: "fa-book",   val: `${course.lessons?.length || 0} lessons` },
                  { icon: "fa-signal", val: course.level },
                ].map(({ icon, val }) => (
                  <span key={val} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                    <i className={`fa-solid ${icon}`} style={{ fontSize: 12, color: "var(--accent)" }} />
                    {val}
                  </span>
                ))}
              </div>
            </div>

            {/* Enrollment card */}
            <div style={{
              width: 280, flexShrink: 0,
              background: "var(--bg-elevated)",
              border:     "1px solid var(--border-strong)",
              borderRadius: "var(--radius-xl)",
              padding: 24,
              boxShadow: "var(--shadow-lg)",
              height: "fit-content",
            }}>
              {/* Thumbnail */}
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} style={{
                  width: "100%", height: 140, objectFit: "cover",
                  borderRadius: "var(--radius-lg)", marginBottom: 16,
                }} />
              )}

              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
                {course.price === 0 ? (
                  <span style={{ color: "var(--accent)" }}>Free</span>
                ) : `₹${course.price}`}
              </div>

              {/* Alerts */}
              {error  && <div className="alert-error"   style={{ marginBottom: 12 }}><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
              {success && <div className="alert-success" style={{ marginBottom: 12 }}><i className="fa-solid fa-circle-check" /> {success}</div>}

              {isInstructor ? (
                <div className="alert-success" style={{ justifyContent: "center" }}>
                  <i className="fa-solid fa-chalkboard-user" /> Instructor view
                </div>
              ) : isEnrolled ? (
                <button className="btn-primary" style={{ width: "100%", padding: "12px 0" }}
                  onClick={() => course.lessons?.[0] && setActiveLesson(course.lessons[0])}>
                  <i className="fa-solid fa-play" /> Continue Learning
                </button>
              ) : (
                <button className="btn-primary" disabled={actionLoading} style={{ width: "100%", padding: "12px 0" }}
                  onClick={handleEnroll}>
                  {actionLoading
                    ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Enrolling...</>
                    : <><i className="fa-solid fa-rocket" /> Enroll Now</>}
                </button>
              )}

              <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
                <i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }} />
                30-day money-back guarantee
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── Lessons ── */}
      <div className="container-app" style={{ padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>

          {/* Lesson player — only if enrolled */}
          {isEnrolled && activeLesson && (
            <div style={{ flex: 2, minWidth: 300 }}>
              <div style={{
                background: "var(--bg-surface)",
                border:     "1px solid var(--border)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                marginBottom: 16,
              }}>
                {activeLesson.videoUrl ? (
                  <video controls src={activeLesson.videoUrl} style={{ width: "100%", maxHeight: 380, background: "#000" }} />
                ) : (
                  <div style={{
                    height: 200, background: "var(--bg-elevated)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", gap: 10,
                  }}>
                    <i className="fa-solid fa-file-lines" style={{ fontSize: 32, color: "var(--text-muted)" }} />
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Text lesson</p>
                  </div>
                )}
                <div style={{ padding: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                    {activeLesson.title}
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {activeLesson.content}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Lessons list */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              <i className="fa-solid fa-list" style={{ marginRight: 8, color: "var(--accent)" }} />
              Course Content
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginLeft: 8 }}>
                ({course.lessons?.length || 0} lessons)
              </span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {course.lessons?.length === 0 ? (
                <div style={{
                  padding: 24, textAlign: "center",
                  background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                }}>
                  <i className="fa-solid fa-inbox" style={{ fontSize: 24, color: "var(--text-muted)", marginBottom: 8, display: "block" }} />
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No lessons yet</p>
                </div>
              ) : (
                course.lessons?.map((lesson, idx) => {
                  const isActive = activeLesson?._id === lesson._id;
                  const locked   = !isEnrolled;
                  return (
                    <button key={lesson._id}
                      onClick={() => { if (!locked) setActiveLesson(lesson); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 14px",
                        background: isActive ? "var(--accent-dim)" : "var(--bg-surface)",
                        border: `1px solid ${isActive ? "var(--accent-border)" : "var(--border)"}`,
                        borderRadius: "var(--radius-lg)",
                        cursor: locked ? "default" : "pointer",
                        textAlign: "left",
                        transition: "all 0.15s",
                        fontFamily: "Montserrat, sans-serif",
                      }}>

                      {/* Number / lock */}
                      <div style={{
                        width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
                        background: isActive ? "var(--accent)" : "var(--bg-elevated)",
                        border: `1px solid ${isActive ? "var(--accent)" : "var(--border-strong)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {locked
                          ? <i className="fa-solid fa-lock" style={{ fontSize: 11, color: "var(--text-muted)" }} />
                          : <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "var(--text-inverse)" : "var(--text-muted)" }}>
                              {idx + 1}
                            </span>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 13, fontWeight: 600,
                          color: isActive ? "var(--accent)" : "var(--text-primary)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {lesson.title}
                        </p>
                        {lesson.duration > 0 && (
                          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                            <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
                            {lesson.duration} min
                          </p>
                        )}
                      </div>

                      {lesson.videoUrl && (
                        <i className="fa-solid fa-circle-play" style={{ fontSize: 14, color: isActive ? "var(--accent)" : "var(--text-muted)", flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}