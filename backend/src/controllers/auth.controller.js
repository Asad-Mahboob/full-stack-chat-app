import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password)
      return res.status(400).json({
        messgage: "Error in singup controller. All fields are required.",
      });
    if (password < 6)
      return res
        .status(400)
        .json({ messgage: "Password must be at least 6 characters long." });
    const user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ messgage: "User with this email already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashPassword,
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        message: "User created successfully.",
      });
    } else {
      return res.status(400).json({ messgage: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in singup controller.", error.message);
    return res
      .status(500)
      .json({ messgage: "Error in singup controller.", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({
        messgage: "Error in login controller. All fields are required.",
      });
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ messgage: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ messgage: "Invalid credentials." });

    generateToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      message: "User logged in successfully.",
    });
  } catch (error) {
    console.log("Error in login controller.", error.message);
    return res
      .status(500)
      .json({ messgage: "Error in login controller.", error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "User logged out successfully." });
  } catch (error) {
    console.log("Error in logout controller.", error.message);
    return res
      .status(500)
      .json({ messgage: "Error in logout controller.", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic)
      return res.status(400).json({ message: "Profile picture is required." });
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.url },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller.", error.message);
    return res
      .status(500)
      .json({ messgage: "Error in updateProfile controller.", error: error });
  }
};

export const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller.", error.message);
    return res
      .status(500)
      .json({ messgage: "Error in checkAuth controller.", error: error });
  }
};
