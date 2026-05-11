import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addNewLesson, getCourseById, clearMessages } from "../../features/courses/courseSlice";

export default function AddLesson() {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { current: course, actionLoading, error, success } = useSelector((s) => s.courses);

  const [form, setForm]   = useState({ title: "", content: "", order: 1, duration: "" });
  const [video, setVideo] = useState(null);

  useEffect(() => { dispatch(getCourseById(id)); return () => dispatch(clearMessages()); }, [id]);

  useEffect(() => {
    if (course) setForm((p) => ({ ...p, order: (course.lessons?.length || 0) + 1 }));
  }, [course]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (video) fd.append("video", video);
    dispatch(addNewLesson({ courseId: id, data: fd }));
  };

  return (
    <div className="page">
      <div className="container-app" style={{ padding: "40px 24px", maxWidth: 620 }}>

        <div style={{ marginBottom: 28 }}>
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 16, padding: "6px 0" }}>
            <i className="fa-solid fa-arrow-left" /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Add Lesson
          </h1>
          {course && (
            <p style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 6 }}>
              <i className="fa-solid fa-book" style={{ marginRight: 6 }} />{course.title}
            </p>
          )}
        </div>

        {error   && <div className="alert-error"   style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-check" /> {success} <button className="btn-ghost" style={{ padding: "0 8px", fontSize: 12 }} onClick={() => navigate("/instructor/dashboard")}>Go to dashboard</button></div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <label className="label">Lesson Title *</label>
              <input className="input" name="title" value={form.title} onChange={handleChange}
                required placeholder="e.g. Introduction to Node.js" />
            </div>

            <div>
              <label className="label">Content / Description</label>
              <textarea className="input" name="content" value={form.content} onChange={handleChange}
                rows={4} placeholder="Describe what this lesson covers..."
                style={{ resize: "vertical", lineHeight: 1.6 }} />
            </div>

            {/* Video upload */}
            <div>
              <label className="label">Video Upload (optional)</label>
              <label style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                border: "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer", background: "var(--bg-elevated)",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-strong)"}
              >
                <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0])}
                  style={{ display: "none" }} />
                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="fa-solid fa-film" style={{ fontSize: 16, color: "var(--accent)" }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {video ? video.name : "Click to select video"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>MP4, MOV, AVI supported</p>
                </div>
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="label">Order *</label>
                <input className="input" name="order" type="number" min="1"
                  value={form.order} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Duration (minutes)</label>
                <input className="input" name="duration" type="number" min="0"
                  value={form.duration} onChange={handleChange} placeholder="e.g. 15" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <button type="button" onClick={() => navigate(-1)} className="btn-outline"
                style={{ flex: 1, padding: "12px 0" }}>Cancel</button>
              <button type="submit" disabled={actionLoading} className="btn-primary"
                style={{ flex: 2, padding: "12px 0" }}>
                {actionLoading
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Adding...</>
                  : <><i className="fa-solid fa-plus" /> Add Lesson</>}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}