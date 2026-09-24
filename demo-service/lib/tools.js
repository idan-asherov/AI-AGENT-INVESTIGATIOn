description: "Returns the last 20 lines of orders api, newest first.",
```[cite: 9]

---

### קובץ מלא, מדויק וסופי: `src/lib/tools.js` (או `demo-service/lib/tools.js`)

הנה הקוד המלא והמעודכן[cite: 8, 9]. בצע שמירה (`Cmd + S`) לאחר ההדבקה:

```javascript
import { tool } from "@openai/agents";
import { z } from "zod";
import { callDemoService } from "./demo-service.js";

/**
 * 1. בדיקת תקינות השירות ונתיב ההזמנות
 */
export const checkServiceHealth = tool({
  name: "check_service_health",
  description: "Checks the orders api /health request GET /api/orders",
  parameters: z.object({}),

  async execute() {
    console.log("check_service_health running");
    const health = await callDemoService("/health");
    const orders = await callDemoService("/api/orders");

    return { health, orders };
  },
});

/**
 * 2. שליפת לוגים אחרונים (החדשים ביותר ראשונים, עם הגבלת 200 תווים לשורה)
 */
export const getRecentLogs = tool({
  name: "get_recent-logs",
  description: "Returns the last 20 lines of orders api, newest first.",
  parameters: z.object({}),

  async execute() {
    console.log("get_recent-logs running");
    const result = await callDemoService("/logs");
    if (!result.body) return result;

    return result.body.map((line) => ({
      ...line,
      message: line.message.slice(0, 200),
    }));
  },
});

/**
 * 3. קבלת פרטי תצורת סביבת הייצור
 */
export const getProductionInfo = tool({
  name: "get_production_info",
  description: "Returns which version of ....",
  parameters: z.object({}),

  async execute() {
    console.log("get_production_info running");

    return {
      environment: process.env.NODE_ENV || "production",
      runtime: "Node.js",
      version: "1.0.0",
      containerStatus: "running",
    };
  },
});
```[cite: 8, 9]