import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import { connect } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";
import User from "@/models/User"; // Import model User

export async function POST(req) {
  try {
    console.log("Step 1: Change Password API hit");

    // Lấy session
    const session = await getServerSession(authOptions);
    console.log("Step 2: Session retrieved:", JSON.stringify(session, null, 2));

    if (!session || !session.user) {
      console.log("Step 2.1: Unauthorized - No session or user");
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { userId, oldPassword, newPassword } = await req.json();
    console.log("Step 3: Received data:", { userId, oldPassword, newPassword });

    if (!oldPassword || !newPassword) {
      console.log("Step 3.1: Missing required fields");
      return new Response(JSON.stringify({ message: "Missing fields" }), { status: 400 });
    }

    if (userId !== session.user._id.toString()) {
      console.log("Step 3.2: User ID mismatch", { userId, sessionUserId: session.user._id });
      return new Response(JSON.stringify({ message: "User ID does not match session" }), { status: 403 });
    }

    // Kết nối database
    console.log("Step 4: Attempting to connect to database");
    await connect(); // Chỉ cần gọi để đảm bảo kết nối
    console.log("Step 4.1: Database connection established");

    // Tìm user bằng Mongoose model
    const user = await User.findById(session.user._id);
    console.log("Step 5: User lookup result:", user);

    if (!user) {
      console.log("Step 5.1: User not found");
      return new Response(JSON.stringify({ message: "Không tìm thấy User" }), { status: 404 });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    console.log("Step 6: Password match check:", isMatch);

    if (!isMatch) {
      console.log("Step 6.1: Incorrect current password");
      return new Response(JSON.stringify({ message: "Mật khẩu hiện tại không chính xác" }), { status: 400 });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Step 7: New hashed password generated");

    // Cập nhật mật khẩu bằng Mongoose
    user.password = hashedPassword;
    await user.save();
    console.log("Step 8: Password updated successfully");

    return new Response(JSON.stringify({ message: "Thay đổi mật khẩu thành công" }), { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error.message);
    console.error("Stack trace:", error.stack);
    return new Response(JSON.stringify({ message: "Lỗi máy chủ nội bộ", error: error.message }), { status: 500 });
  }
}