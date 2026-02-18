import React, { useState } from "react";
import GeneralButton from "./GeneralButton";

const ImpressionBox = () => {
  const [impression, setImpression] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleChange = (e) => {
    setImpression(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (impression.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setImpression("");
        setCharCount(0);
      }, 3000);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <span style={styles.icon}>💬</span>
          <h2 style={styles.title}>Share Your Impressions</h2>
        </div>
        <p style={styles.description}>
          We'd love to hear from you! Tell us about your experience — what you
          enjoyed, what inspired you, or any suggestions you have. Your feedback
          helps us grow and improve.
        </p>

        {submitted ? (
          <div style={styles.successMessage}>
            <span style={styles.checkIcon}>✅</span>
            <p style={styles.successText}>
              Thank you for sharing your thoughts! We truly appreciate it.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.textareaWrapper}>
              <textarea
                style={styles.textarea}
                placeholder="Write your impressions here..."
                value={impression}
                onChange={handleChange}
                maxLength={500}
                rows={6}
              />
              <span style={styles.charCount}>{charCount}/500</span>
            </div>
            <GeneralButton
              onPress={handleSubmit}
              disabled={!impression.trim()}
              fullWidth
              colors={["#667eea", "#764ba2"]}
            >
              Submit Impression →
            </GeneralButton>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    padding: "2rem",
    fontFamily:
      "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  container: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "3rem",
    maxWidth: "560px",
    width: "100%",
    boxShadow:
      "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "0.75rem",
  },
  icon: {
    fontSize: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  description: {
    fontSize: "1rem",
    color: "#6b7280",
    lineHeight: 1.7,
    marginBottom: "1.75rem",
    fontWeight: 400,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  textareaWrapper: {
    position: "relative",
  },
  textarea: {
    width: "100%",
    padding: "1rem 1.25rem",
    fontSize: "1rem",
    fontFamily: "inherit",
    border: "2px solid #e5e7eb",
    borderRadius: "16px",
    resize: "vertical",
    outline: "none",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    color: "#1f2937",
    lineHeight: 1.6,
    boxSizing: "border-box",
    background: "#fafafa",
  },
  charCount: {
    position: "absolute",
    bottom: "12px",
    right: "16px",
    fontSize: "0.8rem",
    color: "#9ca3af",
    fontWeight: 500,
  },
  button: {
    padding: "1rem 2rem",
    fontSize: "1.05rem",
    fontWeight: 600,
    fontFamily: "inherit",
    color: "#ffffff",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "14px",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
    letterSpacing: "0.01em",
  },
  buttonArrow: {
    fontSize: "1.2rem",
    transition: "transform 0.3s ease",
  },
  successMessage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    padding: "2.5rem 1rem",
    background: "linear-gradient(135deg, #e0f7ea, #f0fdf4)",
    borderRadius: "16px",
    border: "1px solid #bbf7d0",
  },
  checkIcon: {
    fontSize: "2.5rem",
  },
  successText: {
    fontSize: "1.05rem",
    color: "#166534",
    fontWeight: 500,
    textAlign: "center",
    margin: 0,
    lineHeight: 1.6,
  },
};

export default ImpressionBox;
