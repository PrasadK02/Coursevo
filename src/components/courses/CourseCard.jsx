import { Link } from "react-router-dom";

const LEVELS = {
  beginner:     { label: "Beginner",     color: "#68BA7F" },
  intermediate: { label: "Intermediate", color: "#fbbf24" },
  advanced:     { label: "Advanced",     color: "#f87171" },
};

export default function CourseCard({ course }) {
  const level = LEVELS[course.level] || LEVELS.beginner;

  return (
    <Link to={`/courses/${course._id}`} style={{ textDecoration: "none" }}>
      <div className="card" style={{ overflow: "hidden", cursor: "pointer" }}>

        {/* Thumbnail */}
        <div style={{
          height: 160, background: "var(--bg-elevated)",
          position: "relative", overflow: "hidden",
        }}>
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} style={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.3s ease",
            }} />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--bg-elevated)",
            }}>
              <i className="fa-solid fa-book-open" style={{ fontSize: 36, color: "var(--text-muted)" }} />
            </div>
          )}

          {/* Price badge */}
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: course.price === 0 ? "var(--accent)" : "var(--bg-surface)",
            color:      course.price === 0 ? "var(--text-inverse)" : "var(--text-primary)",
            border:     course.price === 0 ? "none" : "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            padding: "4px 10px",
            fontSize: 13, fontWeight: 700,
            fontFamily: "Montserrat, sans-serif",
          }}>
            {course.price === 0 ? "Free" : `₹${course.price}`}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "14px 16px" }}>

          {/* Level + category */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: level.color,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {level.label}
            </span>
            {course.category && (
              <>
                <span style={{ color: "var(--text-muted)", fontSize: 10 }}>•</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>
                  {course.category}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: 14, fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.4, marginBottom: 8,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {course.title}
          </h3>

          {/* Instructor */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: "var(--accent)", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-inverse)" }}>
                {course.instructor?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
              {course.instructor?.name}
            </span>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            paddingTop: 10, borderTop: "1px solid var(--border)",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
              <i className="fa-solid fa-users" style={{ fontSize: 10, color: "var(--accent)" }} />
              {course.enrollmentCount || 0}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
              <i className="fa-solid fa-book" style={{ fontSize: 10, color: "var(--accent)" }} />
              {course.lessons?.length || 0} lessons
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}