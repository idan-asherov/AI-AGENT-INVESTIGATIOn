export async function readEvents(response, onEvent) {
  // 1. בדיקה האם קריאת ה-HTTP החזירה שגיאה מהשרת
  if (!response.ok) {
    onEvent({
      type: "error",
      message: `The server HTTP error: ${response.status}`,
    });
    return;
  }

  // 2. פתיחת ה-Reader לקריאת תזרים הנתונים החי
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    // צבירת נתונים מפוענחים לתוך ה-buffer
    buffer += decoder.decode(value, { stream: true });

    // פיצול לפי ירידת שורה
    const lines = buffer.split("\n");

    // שמירת החלק האחרון (שאולי עדיין לא שלם) בבאפר
    buffer = lines.pop() || "";

    // מעבר על כל שורת JSON שלמה ושליחתה לממשק
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        onEvent(JSON.parse(trimmed));
      } catch (err) {
        console.error("Failed to parse JSON line:", trimmed, err);
      }
    }
  }

  // אם נשארה שארית בבאפר בסיום הזרם
  if (buffer.trim()) {
    try {
      onEvent(JSON.parse(buffer.trim()));
    } catch (err) {
      console.error("Failed to parse final JSON buffer:", buffer, err);
    }
  }
}
