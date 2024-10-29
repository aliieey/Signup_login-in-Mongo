const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const port = 4000;
const app = express();
const SECRET_KEY = "HERC123445hcbgbik";
app.use(express.json());

// Connect to MongoDB
async function connectDb() {
  try {
    await mongoose.connect("mongodb://localhost/SignUpDb", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Successfully");
  } catch (error) {
    console.log("Error Connecting to Mongo Db", error);
  }
}

connectDb();

// Define User Schema
const Schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create User Model
const User = mongoose.model("User", Schema);

// Endpoint Signup Code
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await User.create({
      name,
      email,
      password,
    });

    res.status(200).json({
      message: "User Data Saved Successfully",
    });
  } catch (err) {
    res.status(402).json({
      message: err.message,
    });
  }
});





// Endpoint Login Code
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(404).json({
        error: "Invalid email and password",
      });
    }

    const token = jwt.sign({ _id: user._id, email: user.email }, SECRET_KEY);
    res.status(200).json({
      message: "User Logged In Successfully",
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "User Not Logged In",
    });
  }
});

// Middleware to Authenticate Token
function authenticateToken(req, res, next) {
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1];
  let token = req.headers.token;

  if (!token) {
    return res.status(404).json({
      message: "Token Not Found",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({
      message: "Invalid Token",
    });
  }
}

// Check if Logged In
app.get("/isLoggedIn", authenticateToken, (req, res) => {
  return res.status(200).json({
    message: "User is authenticated",
    user: req.user,
  });
});

// Update User
app.put("/update", authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const { name } = req.body;

  try {
    const updateUser = await User.findByIdAndUpdate(userId, { name }, { new: true });
    res.status(200).json({
      message: "User updated successfully",
      user: updateUser,
    });
  } catch (error) {
    res.status(401).json({
      message: "User not updated",
    });
  }
});

// Delete User
app.delete("/delete", authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ error: "Error deleting user" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


