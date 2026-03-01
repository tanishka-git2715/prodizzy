import { setupApp } from "../server/app";

let app: any;

export default async function handler(req: any, res: any) {
    if (!app) {
        const result = await setupApp();
        app = result.app;
    }
    return app(req, res);
}
