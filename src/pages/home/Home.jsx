import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCourses } from "../../features/courses/courseSlice";
import CourseCard from "../../components/courses/CourseCard";

const LEVELS    = ["", "beginner", "intermediate", "advanced"];
const LEVEL_LABELS = { "": "All Levels", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export default function Home() {
  const dispatch    = useDispatch();
  const { list: courses, loading, pagination } = useSelector((s) => s.courses);

  const [search,   setSearch]   = useState("");
  const [level,    setLevel]    = useState("");
  const [page,     setPage]     = useState(1);
  const [inputVal, setInputVal] = useState("");

  const load = useCallback(() => {
    dispatch(getCourses({ search, level, page, limit: 9 }));
  }, [dispatch, search, level, page]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputVal); setPage(1); }, 500);
    return () => clearTimeout(t);
  }, [inputVal]);

  return (
    <div className="page">

      {/* ── Hero ── */}
      <div style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        padding: "56px 24px 48px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(104,186,127,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40,
          width: 240, height: 240, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(104,186,127,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
          <div className="stagger">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <span className="badge">
                <i className="fa-solid fa-bolt" style={{ fontSize: 10 }} />
                Learn at your own pace
              </span>
            </div>
            <h1 style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 14,
              maxWidth: 600,
            }}>
              Level up your skills with{" "}
              <span style={{ color: "var(--accent)" }}>Coursevo</span>
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32, maxWidth: 480, lineHeight: 1.6 }}>
              Explore expert-led courses. Learn, build, and grow at your own pace.
            </p>

            {/* Search bar */}
            <div style={{
              display: "flex", gap: 10,
              maxWidth: 520,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              padding: "6px 6px 6px 16px",
              boxShadow: "var(--shadow-md)",
            }}>
              <i className="fa-solid fa-magnifying-glass" style={{
                color: "var(--text-muted)", fontSize: 14,
                alignSelf: "center", flexShrink: 0,
              }} />
              <input
                type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search courses..."
                style={{
                  flex: 1, background: "transparent", border: "none",
                  outline: "none", fontSize: 14, color: "var(--text-primary)",
                  fontFamily: "Montserrat, sans-serif",
                }}
              />
              <button className="btn-primary" style={{ padding: "8px 20px", borderRadius: "var(--radius-md)" }}>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters + Courses ── */}
      <div className="container-app" style={{ padding: "32px 24px" }}>

        {/* Filter pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginRight: 4 }}>
            <i className="fa-solid fa-sliders" style={{ marginRight: 6 }} />
            Filter:
          </span>
          {LEVELS.map((l) => (
            <button key={l} onClick={() => { setLevel(l); setPage(1); }}
              style={{
                padding: "6px 16px",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${level === l ? "var(--accent)" : "var(--border-strong)"}`,
                background: level === l ? "var(--accent-dim)" : "var(--bg-elevated)",
                color:   level === l ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "Montserrat, sans-serif",
              }}>
              {LEVEL_LABELS[l]}
            </button>
          ))}

          {/* Result count */}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
            {pagination.total || 0} courses
          </span>
        </div>

        {/* Course grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <div className="skeleton" style={{ height: 160 }} />
                <div style={{ padding: "14px 16px", background: "var(--bg-surface)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div className="skeleton" style={{ height: 12, width: "40%" }} />
                  <div className="skeleton" style={{ height: 16, width: "90%" }} />
                  <div className="skeleton" style={{ height: 14, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 72, height: 72,
              background: "var(--bg-elevated)", borderRadius: "var(--radius-xl)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid var(--border)",
            }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 28, color: "var(--text-muted)" }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                No courses found
              </p>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Try adjusting your search or filters
              </p>
            </div>
            <button className="btn-outline" onClick={() => { setInputVal(""); setLevel(""); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }} className="stagger">
              {courses.map((c) => <CourseCard key={c._id} course={c} />)}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
                <button className="btn-outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{ padding: "8px 16px" }}>
                  <i className="fa-solid fa-chevron-left" style={{ fontSize: 11 }} />
                  Prev
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: 36, height: 36, borderRadius: "var(--radius-md)",
                    border: `1px solid ${page === p ? "var(--accent)" : "var(--border-strong)"}`,
                    background: page === p ? "var(--accent)" : "var(--bg-elevated)",
                    color:   page === p ? "var(--text-inverse)" : "var(--text-secondary)",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "Montserrat, sans-serif",
                    transition: "all 0.15s",
                  }}>
                    {p}
                  </button>
                ))}
                <button className="btn-outline"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ padding: "8px 16px" }}>
                  Next
                  <i className="fa-solid fa-chevron-right" style={{ fontSize: 11 }} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}