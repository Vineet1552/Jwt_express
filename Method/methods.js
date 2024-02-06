const express = require("express");
const { Data1, Data2 } = require("../Model/model");
const { dataValidator, MarksValidate, verifyToken } = require("../Validator/Validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretkey = "secretkey";
const {v4:uuidv4} = require('uuid');

const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.send("hello main");
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).send("Internal error");
  }
});

// GET method to retrieve all users
router.get("/get", async (req, res) => {
  try {
    const users = await Data1.find({});
    return res.json({ users });
  } catch (error) {
    console.error("Error fetching users", error);
    res.status(500).send("Internal error");
  }
});

// POST method to create a new user
router.post("/post", async (req, res) => {
  try {
    // const validationResult = await dataValidator.validateAsync(req.body);
    // const { firstName, lastName, studentEmail, dailCode, studentPhone, pass } = validationResult;
    await dataValidator.validateAsync(req.body);

    const hash_pass = await bcrypt.hash(req.body.pass, 5);
    req.body.pass = hash_pass;

    // await Data1.create({
    //     firstName,
    //     lastName,
    //     studentEmail,
    //     dailCode,
    //     studentPhone,
    //     pass,
    // });
    await Data1.create(req.body);

    res.send("User created successfully");
  } catch (error) {
    console.error("Error creating user", error);
    return res.status(400).json({ error: error.message });
  }
});

//get for jwt

router.get('/token/:studentEmail/:pass', async (req, res) => {
    try {
        const email = req.params.studentEmail;
        const password = req.params.pass;

        const student = await Data1.findOne({ studentEmail: email });
        // const name = await Data1.find({firstName: "rishab"});
        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }
 
        bcrypt.compare(password, student.pass, function(err, result) {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            if (result) {
                // console.log(student._id) this is our database -> student ki email -> objectid
                // agar pass match generate token
                // const objId = student._id;
                const jti = uuidv4;
                jwt.sign({student, jti}, secretkey, { expiresIn: '30s' }, (error, token) => {
                    if (error) {
                        console.error("Error generating token:", error);
                        return res.status(500).json({ error: "Internal server error" });
                    }
                    res.json({ token });
                });
            } else {
                res.status(401).json({ msg: "Invalid password" });
            }
        });
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


//old

// router.post('/token/:_id', async(req,res) => {
//     let id = req.params;
//     const student = await Data1.findById(id);
//     if (!student) {
//         return res.status(404).json({ msg: "Student not found" });
//     }
//     jwt.sign({student},secretkey,{expiresIn:'30s'}, (error, token) => {

//         res.json({
//             token
//         })
//     })
// })

router.get('/profile', verifyToken, (req, res) => {
    jwt.verify(req.token,secretkey,(err, authData) => {
        if(err) {
            res.send({
                msg: "invalid token"
            })
        }
        else {
            res.send({
                msg: "profile acccessed",
                authData
            })
        }
    })
})


//  till here jwt code

router.put("/update/:_id", async (req, res) => {
  // console.log(req.params)
  try {
    await dataValidator.validateAsync(req.body);
    let data = await Data1.updateOne(req.params, {
      $set: req.body,
    });
    return res.send(data);
    // console.log(req.params);
  } catch (error) {
    console.error("Error creating user", error);
    return res.status(400).json({ error: error.message });
  }
});

// delete
router.delete("/delete/:_id", async (req, res) => {
  try {
    let id = req.params;

    let data = await Data1.deleteOne(id);
    return res.send(data);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

// POST method to update marks for a user
router.post("/updateMarks", async (req, res) => {
  try {
    await MarksValidate.validateAsync(req.body);
    const id = req.query.id;
    const existingUser = await Data1.findOne({ _id: id });

    if (!existingUser) {
      return res.status(404).json({ msg: "User does not exist" });
    }

    await Data2.create({
      id: req.query.id,
      subject: req.body.subject,
      marks: req.body.marks,
    });

    return res.status(200).json({ msg: "Marks updated successfully" });
  } catch (error) {
    console.error("Error updating marks", error);
    return res.status(400).send(error.message);
  }
});

module.exports = router;
