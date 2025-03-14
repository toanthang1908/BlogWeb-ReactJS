"use client"

import React, {useState, useEffect} from "react";
import Link from "next/link";
import Image from "next/image";
import demo_image from "@/public/img/demo_image.jpg";
import {AiOutlineClose} from "react-icons/ai";
import { usePathname } from "next/navigation";
import {signOut, useSession} from "next-auth/react";

const Navbar = () => {
    const [userData, setUserData] = useState({});
    const {data: session, status} =useSession();

    const pathname = usePathname();

    const [showDropdown, setShowDropdown] = useState(false) 

    async function fetchUser(){
        try{
            const res = await fetch(`http://localhost:3000/api/user/${session?.user?.id}`)
            const resData = await res.json();

            setUserData(resData)
        } catch(error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchUser();
    },[session?.user?.id])
    const handleShowDropdown = () => setShowDropdown(prev => true)
    const handleHideDropdown = () => setShowDropdown(prev => false)

    return (
        <div className="container py-2 h-16 flex items-center justify-between">
            <Link href="/">
                <h2>
                    Blog<span className="special-word">Vip</span>
                </h2>
            </Link>

            <ul className="flex items-center gap-3">
                <li>
                    <Link href="/blog" className={ pathname === "/blog" ? "text-primaryColor font-bold" : ""}>Blog</Link>
                </li>

                {
                    session?.user ? (
                        <>
                            <li>
                                <Link href="/create-blog" className={ pathname === "/create-blog" ? "text-primaryColor font-bold" : ""}>Tạo bài viết</Link>
                            </li>
                            <li>
                                <div className="relative">
                                    <Image 
                                        onClick={handleShowDropdown}
                                        src={userData?.avatar?.url ?
                                        userData?.avatar?.url : demo_image}
                                        alt="avatar"
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="w-10 h-10 rounded-full cursor-pointer"
                                    /> 

                                    {showDropdown && (
                                        <div className='absolute top-0 right-0 bg-primaryColorLight p-5'>
                                        <AiOutlineClose onClick={handleHideDropdown} className='w-full cursor-pointer' />
                                        <button onClick={() => {signOut(); handleHideDropdown();}}>Đăng xuất</button>
                                        <Link onClick={handleHideDropdown} href={`/user/${session?.user?._id.toString()}`}>Hồ sơ</Link>
                                    </div>
                                    )}
                                </div>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/login" className={ pathname === "/login" ? "text-primaryColor font-bold" : ""}>Đăng nhập</Link>
                            </li>
                            <li>
                                <Link href="/signup" className={ pathname === "/signup" ? "text-primaryColor font-bold" : ""}>Đăng ký</Link>
                            </li>
                        </>
                    )
                }
            </ul>
        </div>
        
    )
}

export default Navbar