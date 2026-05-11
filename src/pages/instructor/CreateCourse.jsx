import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createNewCourse, clearMessages } from "../../features/courses/courseSlice";

export default function CreateCourse() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { actionLoading, error, success } = useSelector((s) => s.courses);

  const [form, setForm]         = useState({ title: "", description: "", price: "", level: "beginner", category: "" });
  const [thumbnail, setThumb]   = useState(null);
  const [preview,   setPreview] = useState(null);

  useEffect(() => { if (success) { setTimeout(() => navigate("/instructor/dashboard"), 1200); } }, [success]);
  useEffect(() => () => dispatch(clearMessages()), []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleThumb = (e) => {
    const file = e.target.files?.[0];
    if (file) { setThumb(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (thumbnail) fd.append("thumbnail", thumbnail);
    dispatch(createNewCourse(fd));
  };

  return (
    <div className="page">
      <div className="container-app" style={{ padding: "40px 24px", maxWidth: 680 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 16, padding: "6px 0" }}>
            <i className="fa-solid fa-arrow-left" /> Back
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Create New Course
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6 }}>
            Fill in the details to publish your course
          </p>
        </div>

        {error   && <div className="alert-error"   style={{ marginBottom: 20 }}><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: 20 }}><i className="fa-solid fa-circle-check" /> {success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Thumbnail upload */}
            <div>
              <label className="label">Course Thumbnail</label>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                height: preview ? "auto" : 160,
                border: "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer", overflow: "hidden",
                background: "var(--bg-elevated)",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-strong)"}
              >
                <input type="file" accept="image/*" onChange={handleThumb} style={{ display: "none" }} />
                {preview ? (
                  <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 220, objectFit: "cover" }} />
                ) : (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 28, color: "var(--text-muted)", marginBottom: 8, display: "block" }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                      Click to upload thumbnail
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      JPG, PNG, WEBP — recommended 800×450
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="label">Course Title *</label>
              <input className="input" name="title" value={form.title} onChange={handleChange}
                required placeholder="e.g. Complete Node.js Course" />
            </div>

            {/* Description */}
            <div>
              <label className="label">Description *</label>
              <textarea className="input" name="description" value={form.description} onChange={handleChange}
                required rows={4} placeholder="Describe what students will learn..."
                style={{ resize: "vertical", lineHeight: 1.6 }} />
            </div>

            {/* Price + Level in a row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="label">Price (₹) *</label>
                <input className="input" name="price" type="number" min="0"
                  value={form.price} onChange={handleChange}
                  required placeholder="0 for free" />
              </div>
              <div>
                <label className="label">Level</label>
                <select className="input" name="level" value={form.level} onChange={handleChange}
                  style={{ cursor: "pointer" }}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="label">Category</label>
              <input className="input" name="category" value={form.category} onChange={handleChange}
                placeholder="e.g. Web Development, Design, Marketing" />
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
              <button type="button" onClick={() => navigate(-1)} className="btn-outline"
                style={{ flex: 1, padding: "12px 0" }}>
                Cancel
              </button>
              <button type="submit" disabled={actionLoading} className="btn-primary"
                style={{ flex: 2, padding: "12px 0" }}>
                {actionLoading
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating...</>
                  : <><i className="fa-solid fa-rocket" /> Create Course</>}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}