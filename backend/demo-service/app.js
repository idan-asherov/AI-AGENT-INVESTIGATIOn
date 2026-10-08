import express from "express";
import { MongoClient } from "mongodb";

const app = express();
app.use(express.json());

// 1. משתני סביבה
const VERSION = process.env.APP_VERSION || "1.0.0";
const PORT = process.env.PORT || 5001; // מיושר ל-5001 למניעת התנגשות מול Next.js (3000)
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/orders-api";

// 2. אתחול לקוח MongoDB מבוקר (Timeout של 3 שניות לפי המרצה)
let mongoClient = null;
let logs = null;

try {
  mongoClient = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
  });
  logs = mongoClient.db().collection("logs");
} catch (err) {
  console.warn("⚠️ MongoDB initialization warning:", err.message);
}

// 3. פונקציית לוג מובנית (Console + MongoDB)
async function log(arg1, arg2) {
  let level = "info";
  let message = "";

  if (["info", "warn", "error"].includes(arg1)) {
    level = arg1;
    message = arg2;
  } else {
    message = arg1;
    level = arg2 || "info";
  }

  const line = {
    time: new Date(),
    version: VERSION,
    level,
    message,
  };

  console.log(JSON.stringify(line));

  if (logs) {
    try {
      await logs.insertOne(line);
    } catch {
      // המשך פעולה תקין גם אם מסד הנתונים אינו זמין
    }
  }
}

// 4. תלות חיצונית עם בדיקה חיה של דגל התקלה
async function loadPrices() {
  // בדיקה דינמית בכל קריאה מחדש
  if (process.env.FAULT === "on") {
    await fetch("http://pricing-service:5000/prices");
  }
  return { lulav: 50, etrog: 70 };
}

// 5. נתיב בדיקת בריאות
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 6. נתיב גרסת האפליקציה
app.get("/version", (req, res) => {
  res.json({ service: "orders-api", version: VERSION });
});

// 7. נתיב לוגים עבור סוכן ה-AI (שליפה מ-MongoDB)
app.get("/logs", async (req, res) => {
  const newestFirst = { time: -1 };
  try {
    if (logs) {
      const lines = await logs
        .find({}, { projection: { _id: 0 } })
        .sort(newestFirst)
        .limit(20)
        .toArray();
      return res.json(lines);
    }
  } catch {
    // מעבר ל-fallback במקרה של שגיאה
  }

  res.json([
    {
      time: new Date(),
      version: VERSION,
      level: "INFO",
      message: `orders-api ${VERSION} worker running on port ${PORT}`,
    },
  ]);
});

// 8. נתיב הזמנות עסקי (קריאה ל-loadPrices וטיפול בשגיאות)
app.get("/api/orders", async (req, res) => {
  let prices;

  try {
    prices = await loadPrices();
  } catch (error) {
    await log(
      "error",
      `GET /api/orders 500 - cannot reach pricing service ${error.cause} ${error.code} ${error.message}`,
    );

    return res.status(500).json({ error: "Internal server error" });
  }

  await log("info", "GET /api/orders 200");
  res.json({ orders: [{ id: 1, item: "lulav", price: prices.lulav }] });
});

app.get("/orders", (req, res) => res.redirect(301, "/api/orders"));

// 9. נתיב שורש
app.get("/", (req, res) => {
  const isFault = process.env.FAULT === "on";
  res.send(
    `orders-api ${VERSION} is operational (FAULT: ${isFault ? "ON" : "OFF"}).`,
  );
});

// 10. הפעלת השרת
app.listen(PORT, () => {
  console.log(`orders-api ${VERSION} listening on ${PORT}`);
  log("info", `orders-api ${VERSION} started successfully on port ${PORT}`);
});
