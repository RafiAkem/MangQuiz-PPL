import { Express } from "express";
import passport from "passport";
import { db } from "./db";
import { users, userStats, insertUserSchema } from "./schema";
import { hashPassword } from "./auth";
import { eq, sql } from "drizzle-orm";

export function registerAuthRoutes(app: Express) {
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password || typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Invalid input. Username and password required." });
      }

      if (username.length < 3 || password.length < 6) {
        return res.status(400).json({ message: "Username min 3 chars, Password min 6 chars" });
      }

      // Check if user exists
      const [existingUser] = await db.select().from(users).where(eq(users.username, username));
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const passwordHash = await hashPassword(password);
      
      const [newUser] = await db.insert(users).values({
        username,
        passwordHash,
      }).returning();

      // Initialize stats with 1000 MMR using raw SQL to avoid type inference issues
      await db.execute(sql`
        INSERT INTO user_stats (user_id, mmr, rank_tier, wins, losses, win_streak)
        VALUES (${newUser.id}, 1000, 'PLASTIC', 0, 0, 0)
      `);

      req.login(newUser, (err) => {
        if (err) return res.status(500).json({ message: "Error logging in after registration" });
        return res.status(201).json(newUser);
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  app.get("/api/user/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = req.user as any;
    try {
      const [stats] = await db.select().from(userStats).where(eq(userStats.userId, user.id));
      res.json(stats || { mmr: 1000, rankTier: "PLASTIC", wins: 0, losses: 0, winStreak: 0 });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
}
