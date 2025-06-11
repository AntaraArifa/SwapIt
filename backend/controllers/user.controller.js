import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { fullname, email, phoneNumber, password, role } = req.body;

    // Detailed field-by-field validation
    if (!fullname) return res.status(400).json({ message: "Missing fullname", success: false });
    if (!email) return res.status(400).json({ message: "Missing email", success: false });
    if (!phoneNumber) return res.status(400).json({ message: "Missing phoneNumber", success: false });
    if (!password) return res.status(400).json({ message: "Missing password", success: false });
    if (!role) return res.status(400).json({ message: "Missing role", success: false });

    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is missing", success: false });
    }

    const fileUri = getDataUri(req.file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email) return res.status(400).json({ message: "Missing email", success: false });
    if (!password) return res.status(400).json({ message: "Missing password", success: false });
    if (!role) return res.status(400).json({ message: "Missing role", success: false });

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password.",
        success: false,
      });
    }

    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
      });
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
        success: true,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({
        message: "Logged out successfully.",
        success: true,
      });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    const file = req.file;

    const userId = req.id; // Auth middleware must set this
    let user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
      });
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    if (skills) user.profile.skills = skills.split(",");

    if (file) {
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = file.originalname;
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
      success: true,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
