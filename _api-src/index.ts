import { setupApp } from "../server/app";
import type { Request, Response } from "express";

let app: any;
let setupPromise: Promise<any> | null = null;

export default async function handler(req: Request, res: Response) {
    if (!app) {
        try {
            // One concurrent setup attempt at a time; retries allowed if it fails
            if (!setupPromise) {
                setupPromise = setupApp();
            }
            const result = await setupPromise;
            app = result.app;
        } catch (error: any) {
            setupPromise = null; // allow retry on next request
            console.error("[Vercel] Setup failed:", error.message, error.stack);
            return res.status(500).json({
                error: "Server Initialization Failed",
                details: error.message || String(error),
            });
        }
    }

    return app(req, res);
}
