import { setupApp } from "../server/app";
import type { Request, Response } from "express";

// Capture any module-level crashes immediately for Vercel logs
process.on("uncaughtException", (err) => {
    console.error("[Vercel] UNCAUGHT EXCEPTION:", err.message, err.stack);
});
process.on("unhandledRejection", (reason) => {
    console.error("[Vercel] UNHANDLED REJECTION:", reason);
});

let app: any;
let setupPromise: Promise<any> | null = null;
let setupError: Error | null = null;

export default async function handler(req: Request, res: Response) {
    // If a previous initialization attempt failed fatally, immediately return 500
    if (setupError) {
        console.error("[Vercel] Returning cached setup error:", setupError.message);
        return res.status(500).json({ error: "Server Initialization Failed", details: setupError.message });
    }

    if (!app) {
        try {
            // Ensure only one setup call happens concurrently during cold starts
            if (!setupPromise) {
                console.log("[Vercel] Starting app setup...");
                setupPromise = setupApp();
            }
            const result = await setupPromise;
            app = result.app;
            console.log("[Vercel] App setup complete.");
        } catch (error: any) {
            setupError = error;
            setupPromise = null;
            console.error("[Vercel] Setup failed:", error.message, error.stack);
            return res.status(500).json({ error: "Server Initialization Failed", details: error.message || String(error) });
        }
    }

    return app(req, res);
}
