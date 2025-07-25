import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// Register Controller
export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    // Basic validations
    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const profilePic = req.files?.profilePhoto?.[0];
    if (!profilePic) {
      return res.status(400).json({ message: "Avatar file is missing", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const fileUri = getDataUri(profilePic);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      },
    });

    return res.status(201).json({ message: "Account created successfully", success: true });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing email, password, or role", success: false });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Incorrect email or password", success: false });
    }

    if (role !== user.role) {
      return res.status(400).json({ message: "Account doesn't exist with current role", success: false });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const safeUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullname}`,
        user: safeUser,
        token: token, // ✅ Added token to response body
        success: true,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Logout Controller
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Update Profile Controller
export const updateProfile = async (req, res) => {
  try {
    console.log('Update profile request body:', req.body);
    console.log('Update profile files:', req.files);
    console.log('User from token:', req.user);
    
    const { fullname, email, phoneNumber, bio } = req.body;
    const resume = req.files?.file?.[0];
    const profilePic = req.files?.profilePhoto?.[0];

    const userId = req.user.userId;
    let user = await User.findById(userId);
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(400).json({ message: "User not found", success: false });
    }

    if (!user.profile) user.profile = {};

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;

    if (resume) {
      const fileUri = getDataUri(resume);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = resume.originalname;
    }

    if (profilePic) {
      const fileUri = getDataUri(profilePic);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      user.profile.profilePhoto = cloudResponse.secure_url;
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};


// Get user by ID Controller
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};