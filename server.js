"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const passport = require("passport");
const session = require("express-session");
const { ObjectID } = require("mongodb");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const app = express();
const routes = require("./routes.js");
const auth = require("./auth.js");
const bodyParser = require("body-parser");

let http = require("http").createServer(app);
let io = require("socket.io")(http);

routes(app, myDB);

// Set up the view engines to Pug template
app.set("view engine", "pug");
// Redirect the views to the folder comprises Pug templates
app.set("views", "./views/pug");

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// serialize and deserialize the passport
// passport.serializeUser((user, done) => {
//   done(null, user._id);
// });

// passport.deserializeUser((id, done) => {
//   myDB.findOne({_id: new ObjectID(id)}, (err, doc) => {
//     done(null, null);
//   })
// });

// // function for supervising whether did the user already logged in or not.
// const ensureAuthenticated = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }

//   res.redirect("/");
// };

// // connect app to database
// myDB(async (client) => {
//   const myDataBase = await client.db("database").collection("users");

//   app.route("/").get((req, res) => {
//     res.status(200).render("index", {
//       title: "Connected to Database",
//       message: "Please log in",
//       showLogin: true,
//       showRegistration: true,
//     });
//   });

//   app.post(
//     "/login",
//     passport.authenticate("local", { failureRedirect: "/" }),
//     (req, res) => {
//       res.redirect("/profile");
//     }
//   );

//   app.get("/profile", ensureAuthenticated, (req, res) => {
//     res.render("profile", {
//       username: req.user.username,
//     });
//   });

//   // route for handling logout action towards unauthenticated users
//   app.get("/logout", (req, res) => {
//     req.logout();
//     res.redirect("/");
//   });

//   // route for handling registrating action

//   // app.get("/register", (req, res) => {
//   //   res.status(201).render("index", {
//   //     title: "Connected to the Database",
//   //     message: "Registration Form",
//   //     showRegistration: true,
//   //   });
//   // });

//   app.post(
//     "/register",
//     (req, res, next) => {
//       // const { assignedUsername } = req.body.username;
//       // const { assignedPassword } = req.body.password;
//       // hashing the user's regristed password
//       const hash = bcrypt.hashSync(req.body.password, 12);
//       myDataBase.findOne({ username: req.body.username }, (err, user) => {
//         if (err) {
//           next(err);
//         } else if (user) {
//           res.redirect("/");
//         } else {
//           const newAccount = {
//             username: req.body.username,
//             password: hash,
//           };

//           myDataBase.insertOne(
//             {
//               username: req.body.username,
//               password: hash,
//             },
//             (err, doc) => {
//               if (err) {
//                 res.redirect("/");
//               } else {
//                 // the inserted document is held within the ops property of the doc
//                 next(null, doc.ops[0]);
//               }
//             }
//           );
//         }
//       });
//     },
//     passport.authenticate("local", { failureRedirect: "/" }),
//     (req, res, next) => {
//       res.redirect("/profile");
//     }
//   );

//   // middleware for sending an ERROR page
//   app.use((req, res, next) => {
//     res.status(404).type("text").send("Not Found");
//   });

//   // serialize and deserialize the passport
//   passport.serializeUser((user, done) => {
//     done(null, user._id);
//   });

//   passport.deserializeUser((id, done) => {
//     myDB.findOne({ _id: new ObjectID(id) }, (err, doc) => {
//       done(null, doc);
//     });
//   });

//   passport.use(
//     new LocalStrategy((username, password, done) => {
//       myDataBase.findOne({ username: username }, (err, user) => {
//         console.log(`User ${username} is attempting to log in`);
//         if (err) {
//           return done(err);
//         }

//         if (!user) return done(null, false);
//         // if (password !== user.password) return done(null, false); // before the the user password was being hashed
//         if (!bcrypt.compareSync(password, user.password))
//           return done(null, false);

//         return done(null, user);
//       });
//     })
//   );
// }).catch((err) => {
//   app.get("/", (req, res) => {
//     res.render("index", {
//       title: `Unable to connect to the database`,
//       message: `Error ---> Check >>>> ${err}`,
//     });
//   });
// });

// app.route('/').get((req, res) => {
//   res.status(200).render("index", {title: "Hello", message: "Please log in"});
// });

myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");
  console.log(`Connected to database successfully !`);
  routes(app, myDataBase);
  auth(app, myDataBase);

  io.on("connection", (socket) => {
    console.log(`A user has connected`);
  });
}).catch((err) => {
  app.get("/", (req, res) => {
    res.render("pug", {
      title: "Cannot connect to the database",
      message: `Database unconnection >>>> ${err}`,
    });
  });
});

const PORT = process.env.PORT || 3000;
// app.listen(3000, () => {
//   console.log(`Listening on port 3000...`);
// });

// http.listen(3000, () => {
//   console.log(`Listening on port 3000...`);
//   io.on("connection", (socket) => {
//     console.log("A user has connected");
//   });
// });

http.listen(3000, () => {
  console.log(`Listening on port 3000...`);
});
