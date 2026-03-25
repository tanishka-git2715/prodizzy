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

    // Vercel serverless functions handle MongoDB connections better when
    // connect-mongo creates its own connection distinct from Mongoose's state.
    app.use(
        session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: process.env.MONGODB_URI,
                dbName: "prodizzy", // Specify the DB name
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

    const hasGoogleAuth = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    if (hasGoogleAuth) {
        // Use absolute callback URL when running on Vercel (or any hosted env)
        // Priority: APP_URL > VERCEL_URL > Fallback relative
        let callbackURL = "/api/auth/google/callback";
        if (process.env.APP_URL) {
            callbackURL = `${process.env.APP_URL}/api/auth/google/callback`;
        } else if (process.env.VERCEL_URL) {
            callbackURL = `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
        }

        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

    passport.deserializeUser(async (id: any, done) => {
        try {
            // Optimization: Most lookups are by MongoDB _id (serialized from user.id)
            if (mongoose.isValidObjectId(id)) {
                const user = await User.findById(id).lean();
                if (user) return done(null, user);
            }
            // Fallback for googleId or other cases
            const user = await User.findOne({ googleId: id }).lean();
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    // Auth Routes
    if (hasGoogleAuth) {
        app.get(
            "/api/auth/google",
            passport.authenticate("google", {
                scope: ["profile", "email"],
                // removed prompt: "select_account" to allow seamless login for returning users
            })
        );

        app.get(
            "/api/auth/google/callback",
            passport.authenticate("google", { failureRedirect: "/login?error=google" }),
            async (req, res) => {
                try {
                    if (req.user) {
                        const user = req.user as any;
                        const userId = user._id?.toString() || user.id;

                        // Optimization: Check profileType from user object first (populated by deserializeUser)
                        if (user.profileType === "admin") {
                            return res.redirect("/admin");
                        }
                        
                        // If we already know they completed onboarding, redirect to dashboard
                        if (user.profileType && user.profileType !== "none") {
                             // Double check if business profile needs special handling or if profileType is enough
                             return res.redirect("/dashboard");
                        }

                        // Fallback to full profile lookup if profileType is missing
                        const profile = await storage.getProfileByUserId(userId);

                        console.log(`[Auth Google Callback] userId: ${userId}, profileFound: ${!!profile}, onboardingCompleted: ${profile?.onboarding_completed}`);

                        if (profile && profile.onboarding_completed) {
                            return res.redirect("/dashboard");
                        }

                        if (user.role === "admin") {
                            return res.redirect("/admin");
                        }
                    }
                } catch (error) {
                    console.error("Error in Google Auth callback redirect logic:", error);
                }
                res.redirect("/individual-onboard");
            }
        );
    } else {
        // Fallback for when Google Auth is not configured
        app.get("/api/auth/google", (_req, res) => {
            res.status(501).json({ 
                message: "Google Authentication is not configured on this server.",
                details: "Please verify that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in environment variables."
            });
        });
    }


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

            req.login(user, async (err) => {
                if (err) return next(err);
                
                // Return complete user object with profileStatus, consistent with /api/auth/me
                const userId = user._id?.toString() || user.id;
                const profileStatus = await storage.getProfileStatus(userId);
                res.json({
                    ...user.toObject ? user.toObject() : user,
                    id: userId,
                    profileStatus
                });
            });
        } catch (error) {
            next(error);
        }
    });

    app.get("/api/auth/me", async (req: any, res) => {
        if (req.isAuthenticated()) {
            const userId = req.user._id?.toString() || req.user.id;
            const profileStatus = await storage.getProfileStatus(userId);
            const user = {
                ...req.user,
                id: userId,
                profileStatus
            };
            res.json(user);
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
