const express = require("express");

const app = express();
const cors = require("cors");

const session = require("express-session");
const secretKeys = require("./config/config");

let secrets;
(async () => {
    try {
        secrets = await secretKeys();
        console.log("keys ", res);
    } catch (err) {
        console.log("err");
    }
})();

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

passport.use(
    new facebookStrategy(
        {
            clientID: secretKeys.clientID,
            clientSecret: secretKeys.clientSecret,
            callbackURL:
                "https://ec2-43-205-240-221.ap-south-1.compute.amazonaws.com/auth/facebook/callback",
        },
        function (accessToken, refreshToken, profile, done) {
            console.log("acess token ", accessToken);
            console.log("refresh token ", refreshToken);
            console.log("profile ", profile);
            return done(null, profile);
        }
    )
);

app.get("/flogin", addCustomHeader, passport.authenticate("facebook"));

app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { session: false }),
    (req, res) => {
        res.send("AUTH WAS GOOD!");
    }
);

app.use(routes);
const PORT = 3000;

app.listen(PORT, (req, res) => {
    console.log("Server is started ", PORT);
});
