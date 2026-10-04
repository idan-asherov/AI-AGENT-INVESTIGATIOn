const BASE_URL = process.env.DEMO_SERVICE_URL || "http://localhost:5000";

export async function callDemoService(path) {
  const started = Date.now();
  // מבטיח שתמיד יש סלאש מוביל תקין ומונע שרשור שגוי
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    const response = await fetch(`${BASE_URL}${normalizedPath}`, {
      signal: AbortSignal.timeout(3000),
    });

    const body = await response.json();
    console.log(body);

    return {
      httpStatus: response.status,
      ms: Date.now() - started,
      body,
    };
  } catch (error) {
    return {
      error: `${error.name} ${error.message}`,
      ms: Date.now() - started,
    };
  }
}
