// http://localhost:3000/api/user/someid

import { connect } from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/jwt";
import Blog from "@/models/Blog";
import User from "@/models/User";

export async function PATCH(req, res) {
  await connect();

  const id = res.params.id;
  const accessToken = req.headers.get("authorization");
  const token = accessToken.split(" ")[1];

  const decodedToken = verifyJwtToken(token);

  if (!accessToken || !decodedToken) {
    return NextResponse.json(
      { error: "trái phép (mã thông báo sai hoặc hết hạn)" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const user = await User.findById(id);

    if (user?._id.toString() !== decodedToken._id.toString()) {
      return NextResponse.json(
        { msg: "Chỉ tác giả mới có thể cập nhật thông tin của mình" },
        { status: 403 }
      );
    }

    const updateUser = await User.findByIdAndUpdate(
      user?._id,
      body,
      { new: true }
    );

    return NextResponse.json(updateBlog, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "PATCH error" }, {status: 500});
  }
}

export async function GET(req, res) {
  await connect();

  const id = res.params.id;

  try {
    const user = await User.findById(id).select("-password -__v");

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "GET error" },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req, res) {
    await connect();
  
    const id = res.params.id;
    const accessToken = req.headers.get("authorization");
    const token = accessToken.split(" ")[1];
  
    const decodedToken = verifyJwtToken(token);
  
    if (!accessToken || !decodedToken) {
      return NextResponse.json(
        { error: "trái phép (mã thông báo sai hoặc hết hạn)" },
        { status: 403 }
      );
    }
  
    try {
      const blog = await Blog.findById(id).populate("authorId");
  
      if (blog?.authorId?._id.toString() !== decodedToken._id.toString()) {
        return NextResponse.json(
          { msg: "Chỉ tác giả mới có thể xóa blog của mình" },
          { status: 403 }
        );
      }
  
      await Blog.findByIdAndDelete(id)
  
      return NextResponse.json({msg: "Xoá blog thành công"}, { status: 200 });
    } catch (error) {
      return NextResponse.json({ message: "Xóa lỗi" }, {status: 500});
    }
  }
