const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post('/', async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  const secret = process.env.secret;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      const token = createToken(userExists);
      res.status(200).send({
        data: userExists,
        message: 'success',
        status: true,
        token,
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      firstName,
      lastName,
      passwordHash,
    });

    const token = createToken(user);
    res.status(200).send({
      data: user,
      message: 'success',
      token,
      status: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({message: 'Failed to create user', status: false});
  }
});

function createToken(user) {
  const { id, firstName, lastName, email } = user;
  const token = jwt.sign(
    {
      userId: id,
      firstName,
      lastName,
      email,
    },
    secret,
    { expiresIn: '1d' }
  );
  return token;
}

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
