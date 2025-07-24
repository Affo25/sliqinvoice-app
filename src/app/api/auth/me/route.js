import { NextResponse } from "next/server";
import  {cookies}  from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "yoursecret";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    
    console.log('Cookie store:', cookieStore);
    console.log('Auth token:', token ? 'Token present' : 'No token found');

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('Decoded JWT:', decoded);

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name || "",
        permissions: decoded.permissions || [],
      },
    });
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return NextResponse.json(
      { message: "Invalid or expired token", success: false },
      { status: 401 }
    );
  }
}
