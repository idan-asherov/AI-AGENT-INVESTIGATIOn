import express from "express";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// 1. Health check endpoint (עבור checkServiceHealth)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "demo-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 2. Orders business route (תמיכה גם ב-/api/orders וגם ב-/orders)
const handleOrders = (req, res) => {
  res.status(200).json({
    status: "ok",
    totalOrders: 142,
    activeOrders: 12,
    failedOrders: 0,
    timestamp: new Date().toISOString(),
  });
};
app.get("/api/orders", handleOrders);
app.get("/orders", handleOrders);

// 3. Logs endpoint (עבור getRecentLogs)
app.get("/logs", (req, res) => {
  res.status(200).json([
    {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "Worker thread started successfully and listening on port 5001.",
    },
    {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "GET /health liveness probe responded with status 200.",
    },
    {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message: "GET /api/orders processed request payload successfully.",
    },
    {
      timestamp: new Date().toISOString(),
      level: "WARN",
      message: "Order cache TTL expired; refreshing in-memory dataset.",
    },
  ]);
});

// 4. Root fallback
app.get("/", (req, res) => {
  res.send("Demo Service backend is operational.");
});

app.listen(PORT, () => {
  console.log(`🚀 Demo Service listening on http://localhost:${PORT}`);
});
