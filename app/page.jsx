"use client";

import Image from "next/image";
import logo from "@/public/img/logo.jpg";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";

// Thêm CSS inline trong file hoặc trong file CSS riêng
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in {
    animation: fadeIn 1s ease-out forwards;
  }
  .hover-scale:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease;
  }
  .special-word {
    color: #primaryColor; /* Màu vàng cũ thay vì #ff6b6b */
  }
`;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Đảm bảo hiệu ứng chạy khi component mount
    document.querySelectorAll(".fade-in").forEach((el, index) => {
      el.style.animationDelay = `${index * 0.2}s`; // Tạo độ trễ cho từng phần tử
    });
  }, []);

  const handleExploreClick = () => {
    router.push("/blog"); // Chuyển hướng đến trang blog
  };

  return (
    <>
      <style>{styles}</style>
      <div className="container flex flex-col md:flex-row gap-5 h-[calc(100vh-4rem)] md:items-center">
        {/* Phần nội dung */}
        <div className="basis-full flex flex-col justify-center md:basis-2/3 space-y-5">
          <p className="special-word text-xs fade-in">
            Chào mừng đến với thế giới VIP
          </p>
          <h1 className="pb-5 fade-in">
            <TypeAnimation
              sequence={["BlogVip", 1000]}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
              className="special-word"
            />
            <span> - Nơi bạn thỏa sức viết bài.</span>
          </h1>
          <p className="text-lg font-semibold fade-in">
            Khám phá không gian sáng tạo không giới hạn!
          </p>
          <p className="fade-in">
            BlogVip là nơi chia sẻ những câu chuyện độc đáo, ý tưởng sáng tạo và trải nghiệm đỉnh cao. 
            Từ những bài viết sâu sắc đến hình ảnh ấn tượng, đây là nơi bạn tìm thấy cảm hứng và sự khác biệt.
          </p>

          {/* Thống kê */}
          <div className="flex gap-10 mt-5 fade-in">
            <div className="text-center">
              <p className="text-2xl font-bold special-word">500+</p>
              <p className="text-sm">Bài viết</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold special-word">1K+</p>
              <p className="text-sm">Người dùng</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold special-word">10K+</p>
              <p className="text-sm">Lượt xem</p>
            </div>
          </div>

          {/* Nút CTA */}
          <button
            className="mt-5 px-6 py-3 bg-primaryColor text-white rounded-lg hover-scale fade-in"
            onClick={handleExploreClick}
          >
            Khám phá ngay
          </button>
        </div>

        {/* Phần hình ảnh */}
        <motion.div
          className="basis-full md:basis-1/3 flex justify-center"
          initial={{ y: 0 }}
          whileInView={{ y: -20 }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          <Image
            src={logo}
            alt="BlogVip Logo"
            sizes="100vw"
            className="w-full h-auto max-w-xs md:max-w-full mx-auto md:mx-0"
          />
        </motion.div>
      </div>
    </>
  );
}