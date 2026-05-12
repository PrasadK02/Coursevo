import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getCourseById, enroll, clearMessages,
  getMyEnrollments, deleteLessonFromCourse
} from "../../features/courses/courseSlice";

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
    if (token) dispatch(getMyEnrollments());
    return () => dispatch(clearMessages());
  }, [id, dispatch, token]);

  useEffect(() => {
    if (course?.lessons?.length > 0 && !activeLesson) {
      setActiveLesson(course.lessons[0]);
    }
  }, [course]);

  // Proper string comparison
  const isEnrolled = enrollments.some((e) => {
    const cid = e.course?._id || e.course;
    return cid?.toString() === id?.toString();
  });

  const isInstructor   = user?.role === "instructor";
  const isCourseOwner  = isInstructor && course?.instructor?._id === user?._id;

  const handleEnroll = () => {
    if (!token) { navigate("/login"); return; }
    dispatch(enroll(id));
  };

  const handleDeleteLesson = (lessonId, lessonTitle) => {
    if (!window.confirm(`Delete "${lessonTitle}"? This cannot be undone.`)) return;
    dispatch(deleteLessonFromCourse({ courseId: id, lessonId }));
    // If deleted lesson was active, go to first
    if (activeLesson?._id === lessonId) {
      const remaining = course.lessons.filter((l) => l._id !== lessonId);
      setActiveLesson(remaining[0] || null);
    }
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

              <h1 style={{
                fontSize: "clamp(20px, 4vw, 30px)", fontWeight: 800,
                color: "var(--text-primary)", letterSpacing: "-0.02em",
                lineHeight: 1.3, marginBottom: 12,
              }}>
                {course.title}
              </h1>

              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                {course.description}
              </p>

              {/* Instructor row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-inverse)" }}>
                    {course.instructor?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{course.instructor?.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Instructor</p>
                </div>
              </div>

              {/* Stats */}
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
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-xl)",
              padding: 24, boxShadow: "var(--shadow-lg)",
              height: "fit-content",
            }}>
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} style={{
                  width: "100%", height: 140, objectFit: "cover",
                  borderRadius: "var(--radius-lg)", marginBottom: 16,
                }} />
              )}

              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
                {course.price === 0
                  ? <span style={{ color: "var(--accent)" }}>Free</span>
                  : `₹${course.price}`}
              </div>

              {error   && <div className="alert-error"   style={{ marginBottom: 12 }}><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
              {success && <div className="alert-success" style={{ marginBottom: 12 }}><i className="fa-solid fa-circle-check" /> {success}</div>}

              {isCourseOwner ? (
                // Instructor owns this course
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="alert-success" style={{ justifyContent: "center" }}>
                    <i className="fa-solid fa-chalkboard-user" /> Your Course
                  </div>
                  <Link to={`/instructor/courses/${id}/add-lesson`} className="btn-outline"
                    style={{ justifyContent: "center", padding: "10px 0" }}>
                    <i className="fa-solid fa-plus" /> Add Lesson
                  </Link>
                  <Link to={`/instructor/courses/${id}/quiz`} className="btn-outline"
                    style={{ justifyContent: "center", padding: "10px 0" }}>
                    <i className="fa-solid fa-wand-magic-sparkles" /> Generate Quiz
                  </Link>
                </div>
              ) : isEnrolled ? (
                // Student enrolled
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="alert-success" style={{ justifyContent: "center", marginBottom: 4 }}>
                    <i className="fa-solid fa-circle-check" /> Enrolled
                  </div>
                  <Link to={`/courses/${id}/chat`} className="btn-outline"
                    style={{ justifyContent: "center", padding: "10px 0" }}>
                    <i className="fa-solid fa-robot" /> Ask AI Tutor
                  </Link>
                  <Link to={`/courses/${id}/quiz`} className="btn-outline"
                    style={{ justifyContent: "center", padding: "10px 0" }}>
                    <i className="fa-solid fa-circle-question" /> Take Quiz
                  </Link>
                </div>
              ) : (
                // Not enrolled
                <button className="btn-primary" disabled={actionLoading}
                  style={{ width: "100%", padding: "12px 0" }}
                  onClick={handleEnroll}>
                  {actionLoading
                    ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Enrolling...</>
                    : <><i className="fa-solid fa-rocket" /> Enroll Now</>}
                </button>
              )}

              {!isInstructor && !isEnrolled && (
                <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }} />
                  30-day money-back guarantee
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lessons + Player ── */}
      <div className="container-app" style={{ padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>

          {/* Video player — enrolled students or course owner */}
          {(isEnrolled || isCourseOwner) && activeLesson && (
            <div style={{ flex: 2, minWidth: 300 }}>
              <div style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 16,
              }}>
                {/* ── Video fix ── */}
                {activeLesson.videoUrl ? (
                  <div style={{ background: "#000", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", overflow: "hidden" }}>
                    <video
                      key={activeLesson._id}
                      controls
                      controlsList="nodownload"
                      style={{ width: "100%", maxHeight: 400, display: "block" }}
                    >
                      <source src={activeLesson.videoUrl} type="video/mp4" />
                      <source src={activeLesson.videoUrl} type="video/webm" />
                      Your browser does not support HTML5 video.
                    </video>
                  </div>
                ) : (
                  <div style={{
                    height: 200, background: "var(--bg-elevated)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", gap: 10,
                  }}>
                    <i className="fa-solid fa-file-lines" style={{ fontSize: 32, color: "var(--text-muted)" }} />
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Text lesson — no video</p>
                  </div>
                )}

                <div style={{ padding: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                    {activeLesson.title}
                  </h2>
                  {activeLesson.content && (
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                      {activeLesson.content}
                    </p>
                  )}
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
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {isCourseOwner ? "No lessons yet. Add your first lesson!" : "No lessons yet"}
                  </p>
                  {isCourseOwner && (
                    <Link to={`/instructor/courses/${id}/add-lesson`} className="btn-primary"
                      style={{ marginTop: 12, display: "inline-flex" }}>
                      <i className="fa-solid fa-plus" /> Add Lesson
                    </Link>
                  )}
                </div>
              ) : (
                course.lessons?.map((lesson, idx) => {
                  const isActive = activeLesson?._id === lesson._id;
                  const locked   = !isEnrolled && !isCourseOwner;

                  return (
                    <div key={lesson._id} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      background: isActive ? "var(--accent-dim)" : "var(--bg-surface)",
                      border: `1px solid ${isActive ? "var(--accent-border)" : "var(--border)"}`,
                      borderRadius: "var(--radius-lg)",
                      transition: "all 0.15s",
                      overflow: "hidden",
                    }}>
                      {/* Lesson button */}
                      <button
                        onClick={() => { if (!locked) setActiveLesson(lesson); }}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px",
                          background: "transparent", border: "none",
                          cursor: locked ? "default" : "pointer",
                          textAlign: "left", fontFamily: "Montserrat, sans-serif",
                        }}>
                        {/* Number / lock icon */}
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
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                            {lesson.duration > 0 && (
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                <i className="fa-regular fa-clock" style={{ marginRight: 3 }} />
                                {lesson.duration} min
                              </span>
                            )}
                            {lesson.videoUrl && (
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                <i className="fa-solid fa-circle-play" style={{ marginRight: 3, color: "var(--accent)" }} />
                                Video
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* ── Delete button — instructor owner only ── */}
                      {isCourseOwner && (
                        <button
                          onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                          title="Delete lesson"
                          style={{
                            width: 32, height: 32, borderRadius: "var(--radius-md)",
                            background: "transparent", border: "none",
                            color: "var(--text-muted)", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, marginRight: 8, transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--error)"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <i className="fa-solid fa-trash" style={{ fontSize: 12 }} />
                        </button>
                      )}
                    </div>
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