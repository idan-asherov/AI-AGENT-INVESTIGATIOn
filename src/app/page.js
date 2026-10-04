"use client";

import React, { useState } from "react";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleInvestigate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query || "Please check the demo service health and recent logs.",
        }),
      });

      const data = await res.json();
      setResponse(data.reply || data.error || "No response received.");
    } catch (err) {
      setResponse(`Error connecting to agent: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1>AGENT-API-DEVOPS Control Panel</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Responsible for the investigaiton and the diagnose and explain the operational problems
      </p>

      <form onSubmit={handleInvestigate} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        <textarea
          rows={4}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter investigation prompt (e.g., Check backend health and inspect recent logs)..."
          style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: loading ? "#999" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            alignSelf: "flex-start",
          }}
        >
          {loading ? "Investigating..." : "Run Investigation"}
        </button>
      </form>

      {response && (
        <section style={{ backgroundColor: "#f5f5f5", padding: "16px", borderRadius: "6px", border: "1px solid #e5e5e5" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>Agent Investigation Findings:</h2>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontSize: "14px" }}>
            {response}
          </pre>
        </section>
      )}
    </main>
  );
}
