import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "./models";
import session from "express-session";
// Use require-style interop to avoid esbuild CJS bundle wrapping connect-mongo with .default
// eslint-disable-next-line @typescript-eslint/no-require-imports
const connectMongo = require("connect-mongo");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MongoStore: any = connectMongo.default ?? connectMongo;

import { Express } from "express";
import bcrypt from "bcryptjs";

export function setupAuth(app: Express) {
    const sessionSecret = process.env.SESSION_SECRET || "prodizzy_default_secret";
    const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/prodizzy";

    app.use(
        session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: mongoUrl,
                ttl: 14 * 24 * 60 * 60, // 14 days
            }),
            cookie: {
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 14 * 24 * 60 * 60 * 1000,
            },
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        // Use absolute callback URL when running on Vercel (or any hosted env)
        // Set APP_URL in Vercel env vars to e.g. https://prodizzy-seven.vercel.app
        const callbackURL = process.env.APP_URL
            ? `${process.env.APP_URL}/api/auth/google/callback`
            : "/api/auth/google/callback";

        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL,
                },
                async (_accessToken, _refreshToken, profile, done) => {
                    try {
                        let user = await User.findOne({ googleId: profile.id });
                        if (!user) {
                            user = new User({
                                googleId: profile.id,
                                email: profile.emails?.[0].value,
                                displayName: profile.displayName,
                                avatarUrl: profile.photos?.[0].value,
                            });
                            await user.save();
                        }
                        return done(null, user);
                    } catch (error) {
                        return done(error);
                    }
                }
            )
        );
    } else {
        console.warn("Google OAuth credentials missing. Google login disabled.");
    }

    passport.use(
        new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user || !user.password) {
                    return done(null, false, { message: "Invalid email or password" });
                }
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "Invalid email or password" });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    // Auth Routes
    app.get(
        "/api/auth/google",
        passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/login" }),
        (req, res) => {
            res.redirect("/");
        }
    );

    app.post("/api/auth/register", async (req, res, next) => {
        try {
            const { email, password, displayName } = req.body;
            if (!email || !password || password.length < 6) {
                return res.status(400).json({ message: "Invalid email or password (min 6 chars)" });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({
                email,
                password: hashedPassword,
                displayName: displayName || email.split("@")[0],
            });
            await user.save();

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(201).json(user);
            });
        } catch (error) {
            next(error);
        }
    });

    app.post("/api/auth/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: any, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ message: info.message || "Login failed" });
            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        })(req, res, next);
    });

    app.get("/api/auth/me", (req, res) => {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).json({ message: "Not authenticated" });
        }
    });

    app.post("/api/auth/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.json({ message: "Logged out" });
        });
    });
}
