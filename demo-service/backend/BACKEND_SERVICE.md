# 🛠️ Demo Service Backend & AI Tools Integration

מסמך זה מתעד את שרת ה-API של `demo-service`, את תצורתו הפנימית ואת האופן שבו סוכן ה-AI דוגם אותו באמצעות `tools.js`.

---

## 📌 תצורת השירות (Service Configuration)
* **סביבת ריצה:** Node.js (ES Modules עם `"type": "module"`).
* **פורט האזנה:** `5001` (מוגדר למניעת התנגשויות מול Next.js על 3000 ו-AirPlay על 5000).
* **נתיב פיזי:** `demo-service/backend/app.js`.

---

## 🔌 נקודות קצה (API Endpoints)

| Method | Endpoint | תיאור | שימוש ב-Agent |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | מחזיר סטטוס תקינות (`healthy`), uptime וגרסה | כלי `checkServiceHealth` |
| `GET` | `/api/orders` | מחזיר נתוני פעילות והזמנות מהמערכת | כלי `checkServiceHealth` |
| `GET` | `/logs` | מחזיר מערך של רשומות לוג אחרונות | כלי `getRecentLogs` |

---

## 🤖 אינטגרציה מול כלי ה-Agent (`tools.js`)
1. **`checkServiceHealth`**: מבצע בדיקה כפולה מול נתיב `/health` ונתיב `/api/orders` במקביל.
2. **`getRecentLogs`**: שולף את הלוגים מ-`/logs` ומבצע חיתוך בטיחותי של עד 200 תווים להודעה (`slice(0, 200)`), כדי למנוע הצפת חלון ההקשר (Context Window) של מודל השפה.
3. **`getProductionInfo`**: מחזיר מטא-דאטה אודות גרסת הסביבה.

---

## 🚀 פקודות הפעלה ובדיקה
```bash
# הרצת השרת
node app.js

# בדיקת בריאות ואימות
curl -i http://localhost:5001/health
curl -i http://localhost:5001/api/orders
curl -i http://localhost:5001/logs
