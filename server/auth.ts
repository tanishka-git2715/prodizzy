import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "./models";
import session from "express-session";
import MongoStore from "connect-mongo";
import { Express } from "express";

export function setupAuth(app: Express) {
    const sessionSecret = process.env.SESSION_SECRET || "prodizzy_default_secret";

    app.use(
        session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: process.env.MONGODB_URI,
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

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: "/api/auth/google/callback",
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
