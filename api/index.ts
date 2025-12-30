import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { log } from "../server/vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug logging for deployment
console.log("API function starting...");
console.log("Current working directory:", process.cwd());
console.log("Node environment:", process.env.NODE_ENV);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Register API routes (this returns a server but we don't need it for Vercel)
registerRoutes(app).catch(console.error);

// Serve static files from the built client
const distPath = path.resolve(process.cwd(), "dist/public");
console.log("Looking for dist path:", distPath);
console.log("Dist path exists:", fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  console.log("Serving static files from:", distPath);
  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (SPA routing)
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      console.log("Serving index.html for path:", req.path);
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
} else {
  console.log("Dist path not found, serving error message");
  // Fallback if build doesn't exist
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      console.log("Build not found, returning error for path:", req.path);
      res.status(404).json({
        message: "Client not built. Please run 'npm run build:client' first.",
        path: req.path,
        distPath: distPath,
        cwd: process.cwd(),
      });
    }
  });
}

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("API Error:", err);
  res.status(status).json({ message });
});

// For Vercel, we need to export the app as a serverless function
export default app;
