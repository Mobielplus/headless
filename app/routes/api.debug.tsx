import { json } from "@remix-run/node";

export async function loader() {
  return json({
    status: "ok",
    message: "Debug endpoint is working",
    timestamp: new Date().toISOString(),
    env: {
      // Log environment variables (without values)
      vars: Object.keys(process.env)
    }
  });
}