// auth/routes.ts
import { Router } from "express";
import passport from "./passport";

const router = Router();

// Start Google auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:3000/main"); // redirect after successful login
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/");
});

export default router;