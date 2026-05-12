import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendAiMessage, clearChat } from "../../features/ai/aiSlice";
import { getCourseById } from "../../features/courses/courseSlice";

export default function AIChatbot() {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const { messages, loading } = useSelector((s) => s.ai);
  const { current: course }   = useSelector((s) => s.courses);

  const [input, setInput]   = useState("");
  const [dots,  setDots]    = useState("");
  const bottomRef           = useRef(null);
  const textareaRef         = useRef(null);

  const chatMessages = messages[id] || [];

  useEffect(() => { dispatch(getCourseById(id)); }, [id, dispatch]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, loading]);

  // Animated typing dots
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(t);
  }, [loading]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    dispatch(sendAiMessage({ courseId: id, question: input.trim() }));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const SUGGESTIONS = [
    "Summarize this course for me",
    "What are the key concepts I should know?",
    "Explain the first lesson in simple terms",
    "Give me a quick revision of everything",
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <div style={{
        background: "var(--bg-surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 60, display: "flex", alignItems: "center",
        gap: 14, flexShrink: 0, position: "sticky", top: 64, zIndex: 10,
      }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: "6px 10px" }}>
          <i className="fa-solid fa-arrow-left" />
        </button>

        {/* AI avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: "var(--radius-md)",
          background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <i className="fa-solid fa-robot" style={{ fontSize: 16, color: "var(--accent)" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            AI Tutor
          </p>
          <p style={{ fontSize: 11, color: loading ? "var(--accent)" : "var(--text-muted)", margin: 0 }}>
            {loading ? `Thinking${dots}` : course?.title || "Course Assistant"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link to={`/courses/${id}/quiz`} className="btn-outline" style={{ padding: "7px 14px", fontSize: 12 }}>
            <i className="fa-solid fa-circle-question" /> Take Quiz
          </Link>
          <button onClick={() => dispatch(clearChat(id))} className="btn-ghost" style={{ padding: "7px 10px", fontSize: 12 }}>
            <i className="fa-solid fa-rotate-right" />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Welcome state */}
          {chatMessages.length === 0 && !loading && (
            <div className="animate-fade-in" style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "var(--radius-xl)",
                background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <i className="fa-solid fa-robot" style={{ fontSize: 28, color: "var(--accent)" }} />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                Hi! I'm your AI Tutor
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
                Ask me anything about <strong style={{ color: "var(--accent)" }}>{course?.title}</strong>.
                I'll answer based on the course content.
              </p>

              {/* Suggestion chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    style={{
                      padding: "8px 16px",
                      background: "var(--bg-elevated)",
                      border:     "1px solid var(--border-strong)",
                      borderRadius: "var(--radius-md)",
                      fontSize: 13, fontWeight: 500,
                      color: "var(--text-secondary)",
                      cursor: "pointer", transition: "all 0.15s",
                      fontFamily: "Montserrat, sans-serif",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-dim)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div key={idx} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", gap: 10 }}
                className="animate-fade-in">

                {/* AI avatar */}
                {!isUser && (
                  <div style={{
                    width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
                    background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                  }}>
                    <i className="fa-solid fa-robot" style={{ fontSize: 13, color: "var(--accent)" }} />
                  </div>
                )}

                <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 4 }}>
                  <div style={{
                    padding: "12px 16px",
                    background: isUser ? "var(--accent)" : "var(--bg-surface)",
                    color:      isUser ? "var(--text-inverse)" : "var(--text-primary)",
                    border:     isUser ? "none" : "1px solid var(--border)",
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    fontSize: 14, lineHeight: 1.7, fontWeight: 500,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                    boxShadow: "var(--shadow-sm)",
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{msg.time}</span>
                </div>

                {/* User avatar */}
                {isUser && (
                  <div style={{
                    width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
                    background: "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                  }}>
                    <i className="fa-solid fa-user" style={{ fontSize: 12, color: "var(--text-inverse)" }} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: "flex", gap: 10 }} className="animate-fade-in">
              <div style={{
                width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
                background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className="fa-solid fa-robot" style={{ fontSize: 13, color: "var(--accent)" }} />
              </div>
              <div style={{
                padding: "14px 18px",
                background: "var(--bg-surface)",
                border:     "1px solid var(--border)",
                borderRadius: "18px 18px 18px 4px",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "var(--accent)",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input area ── */}
      <div style={{
        background: "var(--bg-surface)", borderTop: "1px solid var(--border)",
        padding: "14px 16px", flexShrink: 0,
        position: "sticky", bottom: 0,
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            background: "var(--bg-elevated)",
            border:     "1px solid var(--border-strong)",
            borderRadius: "var(--radius-xl)",
            padding: "8px 8px 8px 16px",
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this course..."
              rows={1}
              style={{
                flex: 1, background: "transparent", border: "none",
                outline: "none", resize: "none", overflow: "hidden",
                fontSize: 14, color: "var(--text-primary)",
                fontFamily: "Montserrat, sans-serif",
                lineHeight: 1.5, maxHeight: 120,
                paddingTop: 4,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: "var(--radius-md)",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                background: input.trim() && !loading ? "var(--accent)" : "var(--bg-surface)",
                color: input.trim() && !loading ? "var(--text-inverse)" : "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.15s",
              }}>
              {loading
                ? <span className="spinner" style={{ width: 14, height: 14, borderColor: "var(--text-muted)", borderTopColor: "var(--accent)" }} />
                : <i className="fa-solid fa-paper-plane" style={{ fontSize: 13 }} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
            <i className="fa-solid fa-circle-info" style={{ marginRight: 4 }} />
            Enter to send · Shift+Enter for new line · Answers based on course content only
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}