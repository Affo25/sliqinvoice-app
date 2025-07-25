import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; // ✅ import this
import { NextResponse } from "next/server";
import  User  from "../../../../models/user_models"; // Adjust your import
import jwt from "jsonwebtoken"; // Make sure this is installed (npm i jsonwebtoken)
import connectDB from '../../../../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || "yoursecret"; // store securely in .env

export async function POST(req) {
  try {
     await connectDB();
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Missing credentials", success: false },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false, role: user.role },
        { status: 404 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password", success: false },
        { status: 401 }
      );
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        permissions: user.permissions || [],
      },
      JWT_SECRET,
      { expiresIn: "7d" } // you can change this to 1h, 1d, etc.
    );

   console.log(token);

    // ✅ Login successful response
     const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        permissions: user.permissions,
      },
      success: true,
    });


     // ✅ Set cookie
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Server error", success: false },
      { status: 500 }
    );
  }
}
