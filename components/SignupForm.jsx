"use client"

import React, {useEffect, useState} from "react";
import Input from "./Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialState = {
    name: "",
    email: "",
    password: "",
};

const SignupForm = () => {
    const [hydrated, setHydrated] = useState(false);
    const [state, setState] = useState(initialState);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter()

    useEffect(() => {
        setHydrated(true)
    }, [])

    if(!hydrated) {
        return null;
    }

    const handleSubmit =  async (e) => {
        e.preventDefault();

        const {name, email , password} =state;

        if (!name || !email || !password) {
            setError("Tất cả trường hợp là bắt buộc");
            return;
        }

        // Regular expression pattern for a basic email validation
        const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        if (!pattern.test(email)) {
            setError("Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải dài ít nhất 6 ký tự.");
            return;
        }

        try {
            setIsLoading(true);
            const newUser = {
                name, email, password
            }
            const response = await fetch("http://localhost:3000/api/signup", {
                headers: {
                    "Content-Type" : "application/json"
                },
                method: "POST",
                body: JSON.stringify(newUser)
            })

            if (response?.status === 201){
                setSuccess("Đăng kí thành công");
                setTimeout(() => {
                    router.push("/login", {scroll: false})
                }, 1000)
            } else {
                setError("Đã xảy ra lỗi khi Đăng kí.")
            }
        } catch (error) {
            console.log(error)
        }

        setIsLoading(false);
    }

    const handleChange = (event) => {
        setError("");
        setState({...state, [event.target.name]: event.target.value})
    }

    return (
        <section className="container">
            <form onSubmit={handleSubmit} className="border-2 border-paragraphColor rounded-lg max-w-sm mx-auto px-8 py-6 space-y-5">
                <h2 className="text-center special-word">Đăng kí</h2>

                <Input
                    label="Name"
                    type="text"
                    name="name"
                    onChange={handleChange}
                    value={state.name}
                />
                <Input
                    label="Email"
                    type="text"
                    name="email"
                    onChange={handleChange}
                    value={state.email}
                />
                <Input
                    label="Password"
                    type="password"
                    name="password"
                    onChange={handleChange}
                    value={state.password}
                />
                {
                    error && <div className="text-red-700">{error}</div>
                }

                
                {
                    success && <div className="text-green-700">{success}</div>
                }

                <button type="submit" className="btn w-full">
                    {isLoading ? "Loading" : "Đăng ký"}
                </button>

                <p className="text-center">
                    Đã là người dùng? {" "}
                    <Link href={"/login"} className="text-primaryColor">Đăng nhập</Link>
                </p>
            </form>
        </section>
    )
}

export default SignupForm