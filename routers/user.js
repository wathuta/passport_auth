//all the /user endpoints
const express = require("express");
const router = express.Router();
const User = require("../models/user_models");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/login", (req, res) => {
  console.log(`to do \n<% include ./partials/messages %>`);
  res.render("login");
});

router.get("/register", (req, res) => {
  console.log(`to do \n<%= include ("./partials/messages"); %>`);

  res.render("register");
});

//register handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "please fill in all details" });
  }
  if (password != password2) {
    errors.push({ msg: "passwords do not match" });
  }
  if (password.length < 6) {
    errors.push({ msg: "passwords should be atleast 6 characters" });
  }

  console.log(errors);
  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //user exists
        errors.push({ msg: "Email is alread registered" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        console.log(newUser);
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //set password to hashed
            newUser.password = hash;
            //Save User
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can login"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});
//login Handle
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;
  let errors = [];
  if (!email || !password) {
    errors.push({ msg: "please fill in all details" });
  }
  if (password.length < 6) {
    errors.push({ msg: "passwords should be atleast 6 characters" });
  }
  if (errors.length !== 0) {
    res.render("login", { errors, email, password });
  } else {
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true,
    })(req, res, next);
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_message", "you are logged out");
  res.redirect("/users/login");
});
module.exports = router;
