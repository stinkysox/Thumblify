import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    // BUG FIX: Convert ObjectId to string for the session
    req.session.isLoggedIn = true;
    req.session.userId = (newUser._id as string).toString();

    return res.json({
      message: "account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // BUG FIX: Added check to ensure user.password exists before comparing
    if (!user || !user.password) {
      return res.status(400).json("Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json("Invalid email or password");
    }

    // BUG FIX: Convert ObjectId to string for the session
    req.session.isLoggedIn = true;
    req.session.userId = (user._id as string).toString();

    return res.json({
      message: "Login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((error: any) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });

  return res.json({ message: "logout successfull" });
};

// controller for user verify

export const verifyUser = async (req: Request, res: Response) => {
  try {
    // 1. Get userId from session
    const { userId } = req.session;

    // 2. BUG FIX: Check if userId exists in session before querying DB
    if (!userId) {
      return res.status(401).json("Not authenticated");
    }

    // 3. Find the user (excluding password for security)
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json("Invalid user");
    }

    // 4. Return user data
    return res.json({ user });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
