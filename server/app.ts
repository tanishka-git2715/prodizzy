import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupAuth } from "./auth";
import { connectDB } from "./db";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
    interface IncomingMessage {
        rawBody: unknown;
    }
}

app.use(
    express.json({
        limit: "50mb",
        verify: (req: any, _res, buf) => {
            req.rawBody = buf;
        },
    }),
);

app.use(express.urlencoded({ limit: "50mb", extended: false }));

// IMPORTANT FOR VERCEL
// Allows express-session secure cookies and passport's correct callbackUrl protocol (HTTPS)
app.set("trust proxy", 1);

export function log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });

    console.log(`${formattedTime} [${source}] ${message}`);
}

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
            log(logLine);
        }
    });

    next();
});

export async function setupApp() {
    // Connect to MongoDB first
    await connectDB();

    // Setup Passport and Session AFTER DB is connected (inside async fn, not at module level)
    setupAuth(app);

    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        console.error("Internal Server Error:", err);

        if (res.headersSent) {
            return next(err);
        }

        return res.status(status).json({ message });
    });

    return { app, httpServer };
}

export { app, httpServer };
