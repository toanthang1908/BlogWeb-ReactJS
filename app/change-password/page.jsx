"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const { data: session, status } = useSession(); // Lấy thông tin phiên từ NextAuth

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Kiểm tra trạng thái đăng nhập
    if (status === "unauthenticated") {
      setError("Vui lòng đăng nhập để thay đổi mật khẩu.");
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`, // Gửi token xác thực
        },
        body: JSON.stringify({
          userId: session?.user?._id, // Gửi ID người dùng
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json(); // Lấy dữ liệu phản hồi từ API

      if (response.ok) {
        setSuccess("Đổi mật khẩu thành công!");
        setTimeout(() => router.push("/user/" + session?.user?._id), 2000); // Quay về trang hồ sơ của user
      } else {
        setError(data.message || "Đổi mật khẩu thất bại. Hãy thử lại."); // Hiển thị thông báo lỗi từ API
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      setError("Lỗi hệ thống. Vui lòng thử lại sau.");
    }
  };

  if (status === "loading") {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-5">Thay đổi mật khẩu</h2>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <form onSubmit={handleChangePassword} className="space-y-4">
        <input
          type="password"
          placeholder="Mật khẩu cũ"
          className="block w-full p-2 border rounded text-black" // Thêm text-black để chữ hiển thị rõ
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="block w-full p-2 border rounded text-black"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="block w-full p-2 border rounded text-black"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;