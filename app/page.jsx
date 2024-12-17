import Image from "next/image";
import avtVT from "@/public/img/avtVT.jpg";
import painNaruto from "@/public/img/painNaruto.jpg"

export default function Home() {
  return (
    <div className="container flex flex-col md:flex-row gap-5 h-[calc(100vh-4rem)]">
      <div className="basis-full flex flex-col justify-center md:basis-2/3">
        <p className="special-word text-xs">glory gloryyyyyyyyyyyyyyyyy</p>
        <h1 className="pb-5">
          Manchester <span className="special-word">United</span><br /> tthawsng
        </h1>

        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text.</p>
      </div>

      <div className="hidden md:block basis-1/3">
        <Image 
          src={painNaruto}
          alt="painNaruto"
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
    </div>
  ); 
}
