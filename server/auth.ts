import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "./models";
import session from "express-session";
import { Express } from "express";
import bcrypt from "bcryptjs";
import connectMongo from "connect-mongo";

// connectMongo might be a module object with a default property depending on tsx/esbuild translation.
const MongoStore: any = (connectMongo as any).default || connectMongo;

import mongoose from "mongoose";
import { storage } from "./storage";

export function setupAuth(app: Express) {
    const sessionSecret = process.env.SESSION_SECRET || "prodizzy_default_secret";

    // We reuse the existing mongoose connection from db.ts for the session store
    const clientPromise = mongoose.connection.asPromise().then((conn) => conn.getClient());

    app.use(
        session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                clientPromise: clientPromise,
                dbName: "test", // Or specify the DB name if different from URI
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
                            // Find by email if googleId didn't match, to link existing email accounts to Google
                            if (profile.emails && profile.emails.length > 0) {
                                user = await User.findOne({ email: profile.emails[0].value });
                                if (user) {
                                    user.googleId = profile.id;
                                    user.displayName = user.displayName || profile.displayName;
                                    user.avatarUrl = user.avatarUrl || profile.photos?.[0].value;
                                    await user.save();
                                }
                            }

                            // If still no user, create a brand new one
                            if (!user) {
                                user = new User({
                                    googleId: profile.id,
                                    email: profile.emails?.[0].value,
                                    displayName: profile.displayName,
                                    avatarUrl: profile.photos?.[0].value,
                                });
                                await user.save();
                            }
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
        passport.authenticate("google", {
            scope: ["profile", "email"],
            prompt: "select_account",   // always show account chooser
        })
    );

    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/login?error=google" }),
        async (req, res) => {
            try {
                if (req.user) {
                    const userId = (req.user as any).googleId || (req.user as any).id;
                    const profile = await storage.getProfileByUserId(userId);
                    if (profile && profile.onboarding_completed) {
                        return res.redirect("/dashboard");
                    }
                }
            } catch (error) {
                console.error("Error in Google Auth callback redirect logic:", error);
            }
            res.redirect("/");
        }
    );

    app.post("/api/auth/send-otp", async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

            let user = await User.findOne({ email });
            if (!user) {
                // Create user if they don't exist
                user = new User({
                    email,
                    displayName: email.split("@")[0],
                });
            }

            user.otp = otp;
            user.otpExpiresAt = otpExpiresAt;
            await user.save();

            // Send real email using Nodemailer
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
                const nodemailer = await import("nodemailer");
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                await transporter.sendMail({
                    from: `"Prodizzy Support" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: "Your Prodizzy Login Code",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-w-lg mx-auto; padding: 20px; color: #333;">
                            <h2 style="color: #E63946;">Welcome to Prodizzy</h2>
                            <p>Here is your one-time verification code to sign in:</p>
                            <h1 style="font-size: 32px; letter-spacing: 5px; color: #111;">${otp}</h1>
                            <p>This code will expire in 10 minutes.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #999;">If you didn't request this code, you can safely ignore this email.</p>
                        </div>
                    `,
                });
            } else {
                console.warn("[MAIL] SMTP credentials missing. Falling back to mock email.");
                console.log(`\n========================================`);
                console.log(`[MOCK EMAIL] To: ${email}`);
                console.log(`[MOCK EMAIL] OTP: ${otp}`);
                console.log(`========================================\n`);
            }

            res.json({ message: "OTP sent successfully" });
        } catch (error) {
            next(error);
        }
    });

    app.post("/api/auth/verify-otp", async (req, res, next) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ message: "Email and OTP are required" });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.otp !== otp) {
                return res.status(400).json({ message: "Invalid OTP" });
            }

            if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
                return res.status(400).json({ message: "OTP has expired" });
            }

            // Clear OTP after successful verification
            user.otp = undefined;
            user.otpExpiresAt = undefined;
            await user.save();

            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        } catch (error) {
            next(error);
        }
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
