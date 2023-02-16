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
    let certKey;
    try {
        secretKeys().then((secret) => {
            secrets = JSON.parse(secret.secrets);
            certKey = JSON.parse(secret.certKey);
            console.log("keys ", secrets);
            console.log("certkey ", secret.certKey);
            passport.use(
                new facebookStrategy(
                    {
                        clientID: secrets.clientID,
                        clientSecret: secrets.clientSecret,
                        callbackURL:
                            // "https://localhost:3000/auth/facebook/callback",
                            "https://43.205.240.221:3000/auth/facebook/callback",
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
            https.createServer(options, app).listen(3000, () => {
                console.log("HTTPS server running on localhost on port 3000");
            });
        });
    } catch (err) {
        console.log("err");
    }
})();
