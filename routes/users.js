const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  let user = new User({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    passwordHash: bycrypt.hashSync(req.body.password, 10),
  });

  const secret = process.env.secret;

  // check if email already exists in the db
  const userExists = await User.findOne({ email: req.body.email });

  const createToken = () => {
    const token = jwt.sign(
      {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      secret,
      { expiresIn: "1d" }
    );
    return token;
  };

  if (!userExists) {
    user = await user.save();
    if (!user) {
      res.status(400).send("Failed to create user");
    } else {
      const token = createToken();
      res.status(200).send({
        data: user,
        message: "success",
        token: token,
      });
    }
  } else {
    const token = createToken();
    res.status(200).send({
      data: userExist,
      message: "success",
      token: token,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    //check if email exists
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;
    if (!user) {
      //send error if it doesnt exist
      return res.status(400).send({ status: false, message: "user not found" });
    }

    if (bycrypt.compareSync(req.body.password, user.passwordHash)) {
      //create token and send
      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          passwordHash: user.passwordHash,
        },
        secret,
        { expiresIn: "1d" }
      );

      res
        .status(200)
        .send({
          status: true,
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: token,
          },
        });
    } else {
      res.status(400).send({status: false, message: "password incorrect"});
    }
  } catch (err) {
    console.log(err)
    res.status(500).send({
      status: false,
      message: 'Internal Server Error'
    })
  }
});

module.exports = router;
