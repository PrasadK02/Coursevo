import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { generateCourseQuiz, clearQuiz } from "../../features/quiz/quizSlice";
import { getCourseById } from "../../features/courses/courseSlice";

export default function GenerateQuiz() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, error, success } = useSelector((s) => s.quiz);
  const { current: course } = useSelector((s) => s.courses);

  const [numQ, setNumQ] = useState(5);

  useEffect(() => { dispatch(getCourseById(id)); return () => dispatch(clearQuiz()); }, [id]);

  const handleGenerate = () => {
    dispatch(generateCourseQuiz({ courseId: id, numberOfQuestions: numQ }));
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>

        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ marginBottom: 24, padding: "6px 0" }}>
          <i className="fa-solid fa-arrow-left" /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 24, color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Generate AI Quiz
          </h1>
          {course && (
            <p style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 6 }}>
              <i className="fa-solid fa-book" style={{ marginRight: 6 }} />{course.title}
            </p>
          )}
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
            Gemini AI will read your course lessons and generate MCQ questions automatically.
            If a quiz already exists, it will be replaced.
          </p>
        </div>

        {/* Config card */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: 28, marginBottom: 20,
        }}>

          {error   && <div className="alert-error"   style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
          {success && <div className="alert-success" style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-check" /> {success}</div>}

          <label className="label">Number of questions</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 24 }}>
            {[3, 5, 7, 8, 10].map((n) => (
              <button key={n} type="button" onClick={() => setNumQ(n)}
                style={{
                  padding: "10px 0",
                  borderRadius: "var(--radius-md)",
                  border: `2px solid ${numQ === n ? "var(--accent)" : "var(--border-strong)"}`,
                  background: numQ === n ? "var(--accent-dim)" : "var(--bg-elevated)",
                  color:   numQ === n ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "Montserrat, sans-serif",
                }}>
                {n}
              </button>
            ))}
          </div>

          {/* Info boxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              { icon: "fa-brain",        text: "AI reads all lesson content as context" },
              { icon: "fa-shield-halved", text: "Correct answers hidden from students until submission" },
              { icon: "fa-lightbulb",    text: "Explanations auto-generated for each question" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "var(--radius-md)",
                  background: "var(--accent-dim)", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${icon}`} style={{ fontSize: 12, color: "var(--accent)" }} />
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{text}</span>
              </div>
            ))}
          </div>

          <button className="btn-primary" disabled={actionLoading} onClick={handleGenerate}
            style={{ width: "100%", padding: "14px 0", fontSize: 15 }}>
            {actionLoading ? (
              <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating {numQ} questions...</>
            ) : (
              <><i className="fa-solid fa-wand-magic-sparkles" /> Generate {numQ} Questions</>
            )}
          </button>

          {actionLoading && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
              <i className="fa-solid fa-clock" style={{ marginRight: 4 }} />
              This takes 5–10 seconds. Gemini is reading your course content...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}