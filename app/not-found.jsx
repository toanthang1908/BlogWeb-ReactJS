import React from "react";
import Link from "next/link";

const NotFound = () => {
    return (
        <div className="container h-screen flex flex-col gap-5 justify-center items-center">
            <h2>Không tìm thấy\</h2>
            <p>Không thể tìm thấy tài nguyên được yêu cầu</p>
            <Link href="/">Quay lại Home</Link>
        </div>
    )
}

export default NotFound