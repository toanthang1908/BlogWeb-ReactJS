import Image from "next/image";
import logo from "@/public/img/logo.jpg";

export default function Home() {
  return (
    <div className="container flex flex-col md:flex-row gap-5 h-[calc(100vh-4rem)] md:items-center">
      <div className="basis-full flex flex-col justify-center md:basis-2/3">
        <p className="special-word text-xs">Chào mừng đến với thế giới VIP</p>
        <h1 className="pb-5">
          <span className="special-word">BlogVip</span>
          <span> - Nơi bạn thỏa sức viết bài.</span>
        </h1>

        <p>
          BlogVip là không gian chia sẻ những câu chuyện độc đáo, ý tưởng sáng tạo và trải nghiệm đỉnh cao. 
          Từ những bài viết sâu sắc đến hình ảnh ấn tượng, đây là nơi bạn tìm thấy cảm hứng và sự khác biệt.
        </p>
      </div>

      <div className="basis-full md:basis-1/3">
        <Image 
          src={logo}
          alt="BlogVip Logo"
          sizes="100vw"
          className="w-full h-auto max-w-xs md:max-w-full mx-auto md:mx-0"
        />
      </div>
    </div>
  ); 
}