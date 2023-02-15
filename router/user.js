const passport = require("passport");
const router = require("express").Router();

router.get("/", (req, res) => {
    res.render("pages/index.ejs");
});

router.get("/profile", isLoggedIn, (req, res) => {
    res.render("pages/profile.ejs", {
        user: req.user,
    });
});

router.get("/flogin", passport.authenticate("facebook"));

router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { session: false }),
    (req, res) => {
        res.send("AUTH WAS GOOD!");
    }
);

router.get("/error", isLoggedIn, (req, res) => {
    res.render("pages/error.ejs");
});

router.get(
    "/auth/facebook",
    passport.authenticate("facebook", {
        scope: ["public_profile", "email"],
    })
);

router.get("/auth/facebook/callback", function () {
    passport.authenticate("facebook", {
        successRedirect: "/profile",
        failureRedirect: "/",
    });
});

router.get("/logout", function () {
    res.logout();
    res.redirect("/");
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

module.exports = router;
