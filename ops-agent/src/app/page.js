"use client";

import { useState } from "react";
import { readEvents } from "./read-events";

export default function HomePage() {
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  async function investigate() {
    setRunning(true);
    setEvents([]);
    setReport("");
    setError("");

    try {
      const response = await fetch("/api/investigation", { method: "POST" });

      await readEvents(response, (event) => {
        if (event.type === "report") {
          setReport(event.report);
        } else if (event.type === "error") {
          setError(event.message);
        } else {
          setEvents((prev) => [...prev, event]);
        }
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-7xl font-bold">Ops Agent</h1>
      <p className="text-3xl my-4">AI Agent for investigating bugs!</p>

      <button
        onClick={investigate}
        disabled={running}
        className="text-2xl border border-blue-500 px-4 py-2 rounded hover:bg-blue-500 hover:text-white disabled:opacity-50"
      >
        {running ? "Running..." : "Investigate"}
      </button>

      <h2 className="text-2xl font-semibold mt-6">what agent is doing? </h2>
      <div className="mt-2 space-y-1">
        {events.map((event, i) => (
          <div key={i}>
            {event.type === "tool_called"
              ? `🔧 Tool Called: ${event.tool}`
              : null}
          </div>
        ))}
      </div>

      {report ? (
        <div className="mt-6 p-4 bg-gray-100 rounded border">
          <h2 className="text-2xl font-bold">Report: </h2>
          <p className="whitespace-pre-wrap mt-2">{report}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      ) : null}
    </main>
  );
}
