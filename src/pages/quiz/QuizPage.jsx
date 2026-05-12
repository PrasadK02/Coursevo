import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getQuiz, submitQuizAttempt, clearQuiz } from "../../features/quiz/quizSlice";
import { getCourseById } from "../../features/courses/courseSlice";

export default function QuizPage() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: quiz, loading, actionLoading, error, result } = useSelector((s) => s.quiz);
  const { current: course } = useSelector((s) => s.courses);

  const [answers,  setAnswers]  = useState({});   // { [questionId]: selectedOption }
  const [current,  setCurrent]  = useState(0);

  useEffect(() => {
    dispatch(getCourseById(id));
    dispatch(getQuiz(id));
    return () => dispatch(clearQuiz());
  }, [id, dispatch]);

  // Auto-redirect to results when submitted
  useEffect(() => {
    if (result) navigate(`/courses/${id}/quiz/results`, { state: { result } });
  }, [result]);

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));
    dispatch(submitQuizAttempt({ courseId: id, answers: answersArray }));
  };

  const answered   = Object.keys(answers).length;
  const total      = quiz?.questions?.length || 0;
  const allAnswered = answered === total && total > 0;
  const question   = quiz?.questions?.[current];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p style={{ color: "var(--text-muted)", marginTop: 16 }}>Loading quiz...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 400, padding: 32 }}>
        <div style={{ width: 64, height: 64, background: "var(--bg-elevated)", borderRadius: "var(--radius-xl)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 28, color: "var(--error)" }} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No Quiz Available</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>{error}</p>
        <button className="btn-outline" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left" /> Go Back
        </button>
      </div>
    </div>
  );

  if (!quiz || !question) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>

      {/* ── Header ── */}
      <div style={{
        background: "var(--bg-surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", gap: 14,
        position: "sticky", top: 64, zIndex: 10,
      }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: "6px 10px" }}>
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            <i className="fa-solid fa-circle-question" style={{ color: "var(--accent)", marginRight: 8 }} />
            {course?.title} — Quiz
          </p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
          {answered}/{total} answered
        </span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>

        {/* Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
              Question {current + 1} of {total}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
              {Math.round((answered / total) * 100)}% complete
            </span>
          </div>
          <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${((current + 1) / total) * 100}%`,
              background: "var(--accent)", borderRadius: 3,
              transition: "width 0.3s ease",
            }} />
          </div>

          {/* Question dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {quiz.questions.map((q, i) => (
              <button key={q._id} onClick={() => setCurrent(i)} style={{
                width: 28, height: 28,
                borderRadius: "var(--radius-md)",
                border: `1px solid ${i === current ? "var(--accent)" : answers[q._id] ? "var(--accent-border)" : "var(--border-strong)"}`,
                background: i === current ? "var(--accent)" : answers[q._id] ? "var(--accent-dim)" : "var(--bg-elevated)",
                color:      i === current ? "var(--text-inverse)" : answers[q._id] ? "var(--accent)" : "var(--text-muted)",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                fontFamily: "Montserrat, sans-serif", transition: "all 0.15s",
              }}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question card */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "28px 28px 24px",
          boxShadow: "var(--shadow-md)", marginBottom: 20,
        }} className="animate-fade-in" key={current}>

          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-inverse)" }}>{current + 1}</span>
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.5, margin: 0 }}>
              {question.question}
            </h2>
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {question.options.map((option, oi) => {
              const isSelected = answers[question._id] === option;
              const letters    = ["A", "B", "C", "D"];
              return (
                <button key={oi} onClick={() => handleSelect(question._id, option)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", textAlign: "left",
                    background: isSelected ? "var(--accent-dim)" : "var(--bg-elevated)",
                    border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-strong)"}`,
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer", transition: "all 0.15s",
                    fontFamily: "Montserrat, sans-serif",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.background = "var(--bg-surface)"; } }}
                  onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "var(--bg-elevated)"; } }}
                >
                  {/* Letter badge */}
                  <div style={{
                    width: 30, height: 30, borderRadius: "var(--radius-md)", flexShrink: 0,
                    background: isSelected ? "var(--accent)" : "var(--bg-surface)",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-strong)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "var(--text-inverse)" : "var(--text-muted)" }}>
                      {letters[oi]}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: isSelected ? "var(--accent)" : "var(--text-primary)" }}>
                    {option}
                  </span>
                  {isSelected && (
                    <i className="fa-solid fa-circle-check" style={{ fontSize: 16, color: "var(--accent)", marginLeft: "auto" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn-outline"
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
            style={{ padding: "10px 20px" }}>
            <i className="fa-solid fa-chevron-left" /> Prev
          </button>

          {current < total - 1 ? (
            <button className="btn-primary"
              onClick={() => setCurrent((c) => c + 1)}
              style={{ flex: 1, padding: "10px 0" }}>
              Next <i className="fa-solid fa-chevron-right" />
            </button>
          ) : (
            <button className="btn-primary"
              disabled={!allAnswered || actionLoading}
              onClick={handleSubmit}
              style={{ flex: 1, padding: "10px 0" }}>
              {actionLoading
                ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Submitting...</>
                : <><i className="fa-solid fa-flag-checkered" /> Submit Quiz</>}
            </button>
          )}
        </div>

        {!allAnswered && current === total - 1 && (
          <p style={{ fontSize: 12, color: "var(--warning)", textAlign: "center", marginTop: 10 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 4 }} />
            Please answer all {total - answered} remaining question{total - answered !== 1 ? "s" : ""} before submitting
          </p>
        )}
      </div>
    </div>
  );
}