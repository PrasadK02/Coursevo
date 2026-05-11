import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyCourses, deleteExistingCourse, updateExistingCourse } from "../../features/courses/courseSlice";

export default function InstructorDashboard() {
  const dispatch   = useDispatch();
  const { myCourses: courses, loading, actionLoading } = useSelector((s) => s.courses);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(getMyCourses()); }, [dispatch]);

  const handleTogglePublish = (course) => {
    dispatch(updateExistingCourse({ id: course._id, data: { isPublished: !course.isPublished } }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this course? This cannot be undone.")) {
      dispatch(deleteExistingCourse(id));
    }
  };

  // Stats
  const totalStudents = courses.reduce((a, c) => a + (c.enrollmentCount || 0), 0);
  const published     = courses.filter((c) => c.isPublished).length;

  return (
    <div className="page">
      <div className="container-app" style={{ padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              <i className="fa-solid fa-gauge" style={{ color: "var(--accent)", marginRight: 12 }} />
              Instructor Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
              Welcome back, {user?.name?.split(" ")[0]}
            </p>
          </div>
          <Link to="/instructor/create-course" className="btn-primary">
            <i className="fa-solid fa-plus" /> New Course
          </Link>
        </div>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { icon: "fa-book-open",      label: "Total Courses",     val: courses.length,  color: "var(--accent)" },
            { icon: "fa-circle-check",   label: "Published",         val: published,        color: "#68BA7F" },
            { icon: "fa-clock-rotate-left", label: "Drafts",         val: courses.length - published, color: "var(--warning)" },
            { icon: "fa-users",          label: "Total Students",    val: totalStudents,    color: "#60a5fa" },
          ].map(({ icon, label, val, color }) => (
            <div key={label} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--radius-md)",
                  background: `${color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${icon}`} style={{ fontSize: 14, color }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{label}</span>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Course list */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Your Courses
          </h2>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3].map((i) => (
                <div key={i} style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                  <div className="skeleton" style={{ height: 16, width: "40%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: "70%" }} />
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--bg-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)" }}>
              <i className="fa-solid fa-book-open" style={{ fontSize: 36, color: "var(--text-muted)", marginBottom: 12, display: "block" }} />
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                No courses yet
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>
                Create your first course and share your knowledge
              </p>
              <Link to="/instructor/create-course" className="btn-primary">
                <i className="fa-solid fa-plus" /> Create Course
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {courses.map((course) => (
                <div key={course._id} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)", padding: "14px 18px",
                  flexWrap: "wrap", transition: "border-color 0.15s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--border-strong)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  {/* Thumbnail */}
                  <div style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", overflow: "hidden", flexShrink: 0 }}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="fa-solid fa-book" style={{ fontSize: 18, color: "var(--text-muted)" }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                      {course.title}
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        <i className="fa-solid fa-users" style={{ marginRight: 4 }} />
                        {course.enrollmentCount || 0} students
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        <i className="fa-solid fa-book" style={{ marginRight: 4 }} />
                        {course.lessons?.length || 0} lessons
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        <i className="fa-solid fa-tag" style={{ marginRight: 4 }} />
                        ₹{course.price}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: "4px 10px", borderRadius: "var(--radius-md)",
                    background: course.isPublished ? "rgba(104,186,127,0.15)" : "rgba(251,191,36,0.12)",
                    color:      course.isPublished ? "var(--accent)" : "var(--warning)",
                    border:     `1px solid ${course.isPublished ? "var(--accent-border)" : "rgba(251,191,36,0.3)"}`,
                    flexShrink: 0,
                  }}>
                    <i className={`fa-solid ${course.isPublished ? "fa-circle-check" : "fa-circle"}`} style={{ marginRight: 4 }} />
                    {course.isPublished ? "Published" : "Draft"}
                  </span>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <Link to={`/instructor/courses/${course._id}/add-lesson`}
                      className="btn-outline" style={{ padding: "7px 12px", fontSize: 12 }}>
                      <i className="fa-solid fa-plus" /> Lesson
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(course)}
                      disabled={actionLoading}
                      className="btn-outline"
                      style={{ padding: "7px 12px", fontSize: 12, fontFamily: "Montserrat, sans-serif" }}>
                      <i className={`fa-solid ${course.isPublished ? "fa-eye-slash" : "fa-eye"}`} />
                      {course.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => handleDelete(course._id)} style={{
                      width: 34, height: 34, borderRadius: "var(--radius-md)",
                      background: "transparent", border: "1px solid var(--border-strong)",
                      color: "var(--error)", cursor: "pointer", transition: "all 0.15s",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                    >
                      <i className="fa-solid fa-trash" style={{ fontSize: 12 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}