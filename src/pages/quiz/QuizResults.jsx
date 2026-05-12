import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getQuizResults } from "../../features/quiz/quizSlice";

export default function QuizResults() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const location   = useLocation();
  const { results, loading } = useSelector((s) => s.quiz);

  // result comes from quiz submit redirect state
  const result = location.state?.result;

  useEffect(() => { dispatch(getQuizResults(id)); }, [id, dispatch]);

  if (!result) {
    navigate(`/courses/${id}/quiz`);
    return null;
  }

  const { score, totalScore, percentage, passed, review } = result;

  const scoreColor = percentage >= 70 ? "var(--accent)"  : percentage >= 40 ? "var(--warning)" : "var(--error)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>

      {/* ── Header ── */}
      <div style={{
        background: "var(--bg-surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", gap: 14,
        position: "sticky", top: 64, zIndex: 10,
      }}>
        <button onClick={() => navigate(`/courses/${id}`)} className="btn-ghost" style={{ padding: "6px 10px" }}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Quiz Results</p>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>

        {/* Score card */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "36px 28px",
          textAlign: "center", marginBottom: 28,
          boxShadow: "var(--shadow-lg)",
        }} className="animate-fade-up">

          {/* Score circle */}
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            border: `4px solid ${scoreColor}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            background: `${scoreColor}10`,
          }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{percentage}%</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", marginTop: 2 }}>SCORE</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
            {passed ? "🎉 Well done!" : percentage >= 40 ? "Keep practicing!" : "Don't give up!"}
          </h2>

          <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 20 }}>
            You scored <strong style={{ color: scoreColor }}>{score} out of {totalScore}</strong> questions correctly
          </p>

          {/* Pass/Fail badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: "var(--radius-xl)",
            background: passed ? "rgba(104,186,127,0.15)" : "rgba(248,113,113,0.1)",
            border: `1px solid ${passed ? "var(--accent-border)" : "rgba(248,113,113,0.3)"}`,
            color: passed ? "var(--accent)" : "var(--error)",
            fontSize: 13, fontWeight: 700,
            marginBottom: 24,
          }}>
            <i className={`fa-solid ${passed ? "fa-trophy" : "fa-rotate-right"}`} />
            {passed ? "Passed — 70% threshold met" : "Below 70% passing score"}
          </div>

          {/* Stat pills */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: "fa-circle-check", label: "Correct",   val: score,            color: "var(--accent)" },
              { icon: "fa-circle-xmark", label: "Wrong",     val: totalScore - score, color: "var(--error)" },
              { icon: "fa-list",         label: "Total",     val: totalScore,        color: "var(--text-muted)" },
            ].map(({ icon, label, val, color }) => (
              <div key={label} style={{
                padding: "10px 20px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                textAlign: "center",
              }}>
                <i className={`fa-solid ${icon}`} style={{ fontSize: 16, color, marginBottom: 4, display: "block" }} />
                <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 2px" }}>{val}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, fontWeight: 600 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Review section */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          <i className="fa-solid fa-book-open" style={{ color: "var(--accent)", marginRight: 8 }} />
          Answer Review
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="stagger">
          {review.map((q, idx) => (
            <div key={idx} style={{
              background: "var(--bg-surface)",
              border: `1px solid ${q.isCorrect ? "var(--accent-border)" : "rgba(248,113,113,0.25)"}`,
              borderRadius: "var(--radius-lg)",
              padding: "18px 20px",
              borderLeft: `4px solid ${q.isCorrect ? "var(--accent)" : "var(--error)"}`,
            }}>
              {/* Question */}
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "var(--radius-md)", flexShrink: 0,
                  background: q.isCorrect ? "var(--accent)" : "var(--error)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${q.isCorrect ? "fa-check" : "fa-xmark"}`}
                    style={{ fontSize: 10, color: "#fff" }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
                  {q.question}
                </p>
              </div>

              {/* Answer rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", minWidth: 72 }}>Your answer:</span>
                  <span style={{
                    fontSize: 13, fontWeight: 600, padding: "2px 10px",
                    borderRadius: "var(--radius-md)",
                    background: q.isCorrect ? "rgba(104,186,127,0.15)" : "rgba(248,113,113,0.1)",
                    color:      q.isCorrect ? "var(--accent)" : "var(--error)",
                  }}>
                    {q.selectedOption || "Not answered"}
                  </span>
                </div>
                {!q.isCorrect && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", minWidth: 72 }}>Correct:</span>
                    <span style={{
                      fontSize: 13, fontWeight: 600, padding: "2px 10px",
                      borderRadius: "var(--radius-md)",
                      background: "rgba(104,186,127,0.15)", color: "var(--accent)",
                    }}>
                      {q.correctAnswer}
                    </span>
                  </div>
                )}
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

        {/* Past attempts */}
        {results && results.totalAttempts > 1 && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ color: "var(--accent)", marginRight: 8 }} />
              Past Attempts
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginLeft: 6 }}>
                Best: {results.bestScore}%
              </span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {results.attempts.slice(0, 5).map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px",
                  background: "var(--bg-surface)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 20 }}>#{results.attempts.length - i}</span>
                  <div style={{ flex: 1, height: 6, background: "var(--bg-elevated)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${a.percentage}%`, background: a.passed ? "var(--accent)" : "var(--error)", borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: a.passed ? "var(--accent)" : "var(--error)", minWidth: 40, textAlign: "right" }}>
                    {a.percentage}%
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {new Date(a.attemptedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <Link to={`/courses/${id}`} className="btn-outline" style={{ flex: 1, padding: "12px 0", justifyContent: "center" }}>
            <i className="fa-solid fa-book" /> Back to Course
          </Link>
          <button className="btn-primary" style={{ flex: 1, padding: "12px 0" }}
            onClick={() => navigate(`/courses/${id}/quiz`)}>
            <i className="fa-solid fa-rotate-right" /> Retry Quiz
          </button>
          <Link to={`/courses/${id}/chat`} className="btn-outline" style={{ flex: 1, padding: "12px 0", justifyContent: "center" }}>
            <i className="fa-solid fa-robot" /> Ask AI Tutor
          </Link>
        </div>
      </div>
    </div>
  );
}