const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../database");
const validInfo = require("../middleware/validInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const authorize = require("../middleware/authorize");

//authorizeentication
router.post("/register", validInfo, async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const user = await pool.query(`SELECT * FROM users WHERE email = ${email}`);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);
    const timestamp = Date.now()
    let newUser = await pool.query(
      `INSERT INTO users (user_name, email, password, timestamp) VALUES ('${name}', '${email}', '${bcryptPassword}','${timestamp}') RETURNING *`,
    );

    const jwtToken = jwtGenerator(newUser.rows[0].id);

    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", validInfo, async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password);

  try {
    const user = await pool.query(`SELECT * FROM users WHERE email = '${email}'`)
    

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credential");
    }
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    const jwtToken = jwtGenerator(user.rows[0].id);
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/verify", authorize, (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;