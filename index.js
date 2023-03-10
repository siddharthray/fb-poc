const https = require("https");
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const session = require("express-session");
const secretKeys = require("./config/config");
const passport = require("passport");

const router = express.Router();

const facebookStrategy = require("passport-facebook").Strategy;

const routes = require("./router/user");

let user;

app.set("view engine", "ejs");

app.use(cors());
app.use(
    session({
        resave: false,
        saveUninitialized: true,
        secret: "SECRET",
    })
);

app.use(passport.initialize());

app.use(passport.session());

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (user, cb) {
    cb(null, user);
});
router.get("/flogin", passport.authenticate("facebook"));

router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { session: false }),
    (req, res) => {
        res.render("pages/profile", {
            user,
        });
    }
);

router.get("/", (req, res) => {
    res.render("pages/index.ejs");
});

router.get("/profile", isLoggedIn, (req, res) => {
    res.render("pages/index.ejs", {
        user,
    });
});

app.use(routes);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}

(async () => {
    let secrets;
    let callbackUrl = "";
    if (process.env.NODE_ENV === "dev") {
        callbackUrl = "http://localhost:3000/auth/facebook/callback";
    } else {
        callbackUrl = "https://43.205.240.221:3000/auth/facebook/callback";
    }
    try {
        secretKeys().then((secret) => {
            secrets = JSON.parse(secret.secrets);
            console.log("keys ", secrets);
            passport.use(
                new facebookStrategy(
                    {
                        clientID: secrets.clientID,
                        clientSecret: secrets.clientSecret,
                        callbackURL: callbackUrl,
                    },
                    function (accessToken, refreshToken, profile, done) {
                        console.log("acess token ", accessToken);
                        console.log("refresh token ", refreshToken);
                        console.log("profile ", profile);
                        user = profile;
                        return done(null, profile);
                    }
                )
            );
            const options = {
                key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
                cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
            };
            if (process.env.NODE_ENV === "dev") {
                app.listen(3000, () => {
                    console.log(
                        "Server running successfuly running on port 3000"
                    );
                });
            } else {
                https.createServer(options, app).listen(3000, () => {
                    console.log(
                        "HTTPS server running on localhost on port 3000"
                    );
                });
            }
        });
    } catch (err) {
        console.log("err");
    }
})();
