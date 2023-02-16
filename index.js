const https = require("https");
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const session = require("express-session");
const secretKeys = require("./config/config");
const passport = require("passport");

const facebookStrategy = require("passport-facebook").Strategy;

const routes = require("./router/user");

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
app.get("/flogin", passport.authenticate("facebook"));

app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { session: false }),
    (req, res) => {
        res.send("AUTH WAS GOOD!");
    }
);

app.use(routes);

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
                            "https://localhost:3000/auth/facebook/callback",
                    },
                    function (accessToken, refreshToken, profile, done) {
                        console.log("acess token ", accessToken);
                        console.log("refresh token ", refreshToken);
                        console.log("profile ", profile);
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
