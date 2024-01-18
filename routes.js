const passport = require("passport");
const bcrypt = require("bcrypt");

module.exports = (app, myDataBase) => {
  // function for supervising whether did the user already logged in or not.
  const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }

    res.redirect("/");
  };

  app.route("/").get((req, res) => {
    res.status(200).render("index", {
      title: "Connected to Database",
      message: "Please log in",
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true,
    });
  });

  app.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/profile");
    }
  );

  app.get("/profile", ensureAuthenticated, (req, res) => {
    res.render("profile", {
      username: req.user.username,
    });
  });

  // route for handling logout action towards unauthenticated users
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // app.post(
  //   "/register",
  //   (req, res, next) => {
  //     // const { assignedUsername } = req.body.username;
  //     // const { assignedPassword } = req.body.password;
  //     // hashing the user's regristed password
  //     console.log(`Requested object : ${req.body}`);

  //     const hash = bcrypt.hashSync(req.body.password, 12);
  //     myDataBase.findOne({ username: req.body.username }, (err, user) => {
  //       if (err) {
  //         next(err);
  //       } else if (user) {
  //         res.redirect("/");
  //       } else {
  //         const newAccount = {
  //           username: req.body.username,
  //           password: hash,
  //         };

  //         myDataBase.insertOne(
  //           {
  //             username: req.body.username,
  //             password: hash,
  //           },
  //           (err, doc) => {
  //             if (err) {
  //               res.redirect("/");
  //             } else {
  //               // the inserted document is held within the ops property of the doc
  //               next(null, doc.ops[0]);
  //             }
  //           }
  //         );
  //       }
  //     });
  //   },
  //   passport.authenticate("local", { failureRedirect: "/" }),
  //   (req, res, next) => {
  //     res.redirect("/profile");
  //   }
  // );

  app.post("/register", (req, res, next) => {
    const { username } = req.body;
    const { password } = req.body;
    // console.log(
    //   `Registed username : ${username} \n Registed password: ${password}`
    // );
    console.log(`Requested Object : ${req}`);

    console.log(Object.keys(req));
    console.log(Object.values(req));
  });

  //   app.get("/auth/github", (req, res) => {
  //     return passport.authenticate("github");
  //   });
  app.route("/auth/github").get(passport.authenticate("github"));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
      req.session.user_id = req.user.id;
      res.redirect("/chat");
    }
  );

  app.get("/chat", ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + "/view/pug/chat", { user: req.user });
  });

  // route for ERROR page
  app.use((req, res, next) => {
    res.status(404).type("text").send("ERROR 404 NOT FOUND");
  });
};
