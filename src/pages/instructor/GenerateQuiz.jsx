import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { generateCourseQuiz, getQuiz, clearQuiz } from "../../features/quiz/quizSlice";
import { getCourseById } from "../../features/courses/courseSlice";

export default function GenerateQuiz() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, error, success, current: quiz } = useSelector((s) => s.quiz);
  const { current: course } = useSelector((s) => s.courses);

  const [numQ, setNumQ] = useState(5);

  useEffect(() => {
    dispatch(getCourseById(id));
    dispatch(getQuiz(id));
    return () => dispatch(clearQuiz());
  }, [id, dispatch]);

  const handleGenerate = () => {
    dispatch(generateCourseQuiz({ courseId: id, numberOfQuestions: numQ }))
      .unwrap()
      .then(() => {
        dispatch(getQuiz(id));
      })
      .catch(() => {});
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px" }}>

        <button onClick={() => navigate(-1)} className="btn-ghost"
          style={{ marginBottom: 24, padding: "6px 0" }}>
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
        </div>

        {/* Generate card */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: 28, marginBottom: 24,
        }}>
          {error   && <div className="alert-error"   style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-exclamation" /> {error}</div>}
          {success && <div className="alert-success" style={{ marginBottom: 16 }}><i className="fa-solid fa-circle-check" /> {success}</div>}

          <label className="label">Number of questions</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 24 }}>
            {[3, 5, 7, 8, 10].map((n) => (
              <button key={n} type="button" onClick={() => setNumQ(n)} style={{
                padding: "10px 0", borderRadius: "var(--radius-md)",
                border: `2px solid ${numQ === n ? "var(--accent)" : "var(--border-strong)"}`,
                background: numQ === n ? "var(--accent-dim)" : "var(--bg-elevated)",
                color:   numQ === n ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s", fontFamily: "Montserrat, sans-serif",
              }}>{n}</button>
            ))}
          </div>

          {/* Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              { icon: "fa-brain",         text: "AI reads all lesson content as context" },
              { icon: "fa-shield-halved", text: "Correct answers hidden from students until submission" },
              { icon: "fa-rotate",        text: "Regenerating replaces the existing quiz" },
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

          <button className="btn-primary" disabled={actionLoading}
            onClick={handleGenerate} style={{ width: "100%", padding: "14px 0", fontSize: 15 }}>
            {actionLoading
              ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating {numQ} questions...</>
              : <><i className="fa-solid fa-wand-magic-sparkles" /> {quiz ? "Regenerate Quiz" : `Generate ${numQ} Questions`}</>}
          </button>

          {actionLoading && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
              <i className="fa-solid fa-clock" style={{ marginRight: 4 }} />
              This takes 5–10 seconds...
            </p>
          )}
        </div>

        {/* ── Quiz Preview — instructor ko dikhao ── */}
        {quiz && quiz.questions?.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              <i className="fa-solid fa-eye" style={{ color: "var(--accent)", marginRight: 8 }} />
              Quiz Preview
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", marginLeft: 8 }}>
                {quiz.questions.length} questions — students see this without correct answers
              </span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {quiz.questions.map((q, idx) => (
                <div key={q._id || idx} style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "18px 20px",
                  borderLeft: "4px solid var(--accent)",
                }}>
                  {/* Question */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "var(--radius-md)", flexShrink: 0,
                      background: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-inverse)" }}>
                        {idx + 1}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                      {q.question}
                    </p>
                  </div>

                  {/* Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {q.options?.map((option, oi) => {
                      const letters    = ["A", "B", "C", "D"];
                      const isCorrect  = option === q.correctAnswer;
                      return (
                        <div key={oi} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px",
                          background: isCorrect ? "rgba(104,186,127,0.12)" : "var(--bg-elevated)",
                          border: `1px solid ${isCorrect ? "var(--accent-border)" : "var(--border)"}`,
                          borderRadius: "var(--radius-md)",
                        }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: "var(--radius-md)", flexShrink: 0,
                            background: isCorrect ? "var(--accent)" : "var(--bg-surface)",
                            border: `1px solid ${isCorrect ? "var(--accent)" : "var(--border-strong)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: isCorrect ? "var(--text-inverse)" : "var(--text-muted)" }}>
                              {letters[oi]}
                            </span>
                          </div>
                          <span style={{ fontSize: 13, color: isCorrect ? "var(--accent)" : "var(--text-primary)", fontWeight: isCorrect ? 700 : 500 }}>
                            {option}
                          </span>
                          {isCorrect && (
                            <i className="fa-solid fa-circle-check" style={{ fontSize: 13, color: "var(--accent)", marginLeft: "auto" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div style={{
                      padding: "10px 12px",
                      background: "var(--bg-elevated)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                        <i className="fa-solid fa-lightbulb" style={{ color: "var(--warning)", marginRight: 6 }} />
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No quiz yet */}
        {!quiz && !actionLoading && (
          <div style={{
            textAlign: "center", padding: "32px 24px",
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
          }}>
            <i className="fa-solid fa-circle-question" style={{ fontSize: 28, color: "var(--text-muted)", marginBottom: 12, display: "block" }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              No quiz generated yet for this course
            </p>
          </div>
        )}

      </div>
    </div>
  );
}