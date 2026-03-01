import { setupApp } from "../server/app";
import type { Request, Response } from "express";

let app: any;
let setupPromise: Promise<any> | null = null;
let setupError: Error | null = null;

export default async function handler(req: Request, res: Response) {
    // If a previous initialization attempt failed fatally, immediately return 500
    if (setupError) {
        return res.status(500).json({ error: "Server Initialization Failed", details: setupError.message });
    }

    if (!app) {
        try {
            // Ensure only one setup call happens concurrently during cold starts
            if (!setupPromise) {
                setupPromise = setupApp();
            }
            const result = await setupPromise;
            app = result.app;
        } catch (error: any) {
            setupError = error;
            console.error("Vercel Server Setup Error:", error);
            setupPromise = null; // allow retry on next request
            return res.status(500).json({ error: "Server Initialization Failed", details: error.message || String(error) });
        }
    }

    return app(req, res);
}

