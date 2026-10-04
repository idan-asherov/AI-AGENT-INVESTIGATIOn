import { tool } from "@openai/agents";
import { z } from "zod";

const BASE_URL = process.env.DEMO_SERVICE_URL || "http://localhost:5001";

/**
 * פונקציית עזר לביצוע קריאות HTTP בטוחות לשירות ה-Backend
 */
async function callDemoService(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    const status = response.status;
    const body = await response.json().catch(() => null);

    return { status, body };
  } catch (error) {
    return {
      status: 500,
      body: { error: `Failed to connect to ${endpoint}: ${error.message}` },
    };
  }
}

/**
 * 1. בדיקת תקינות השירות ונתיב ההזמנות
 */
export const checkServiceHealth = tool({
  name: "check_service_health",
  description: "Checks the orders api health via /health and /api/orders",
  parameters: z.object({}).optional(),
  async execute() {
    console.log("🛠️ check_service_health executed");
    const health = await callDemoService("/health");
    const orders = await callDemoService("/api/orders");

    return { health, orders };
  },
});

/**
 * 2. שליפת לוגים אחרונים (הגבלת 200 תווים להודעה למניעת הצפת Token)
 */
export const getRecentLogs = tool({
  name: "get_recent_logs",
  description: "Returns the last 20 log lines of orders api, newest first.",
  parameters: z.object({}).optional(),
  async execute() {
    console.log("🛠️ get_recent_logs executed");
    const result = await callDemoService("/logs");

    if (!result.body || !Array.isArray(result.body)) {
      return result;
    }

    const trimmedLogs = result.body.map((line) => ({
      ...line,
      message:
        typeof line.message === "string"
          ? line.message.slice(0, 200)
          : line.message,
    }));

    return { status: result.status, logs: trimmedLogs };
  },
});

/**
 * 3. קבלת פרטי תצורת סביבת הייצור
 */
export const getProductionInfo = tool({
  name: "get_production_info",
  description: "Returns runtime and container configuration details.",
  parameters: z.object({}).optional(),
  async execute() {
    console.log("🛠️ get_production_info executed");

    return {
      environment: process.env.NODE_ENV || "production",
      runtime: "Node.js",
      version: "1.0.0",
      containerStatus: "running",
      serviceUrl: BASE_URL,
    };
  },
});
