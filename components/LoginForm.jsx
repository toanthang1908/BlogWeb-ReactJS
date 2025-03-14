"use client";
import React, { useState, useEffect } from "react";
import Input from "./Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const initialState = {
  name: "",
  email: "",
  password: "",
};

const LoginForm = () => {
  const [hydrated, setHydrated] = useState(false);

  const [state, setState] = useState(initialState);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  const handleChange = (event) => {
    setError("");
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = state;

    if ( !email || !password) {
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

      const res = await signIn("credentials", {
        email, password, redirect: false
      })

      if(res?.error) {
        setError("Thông tin xác thực không hợp lệ")
        setIsLoading(false);
        return;
      }

      router.push("/blog")
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  return (
    <section className="container">
      <form
        onSubmit={handleSubmit}
        className="border-2 border-paragraphColor rounded-lg max-w-sm mx-auto px-8 py-6 space-y-5"
      >
        <h2 className="text-center special-word">Login</h2>

        <Input
          label="Tên"
          type="text"
          name="email"
          onChange={handleChange}
          value={state.email}
        />
        <Input
          label="Mật khẩu"
          type="password"
          name="password"
          onChange={handleChange}
          value={state.password}
        />

        {error && <div className="text-red-700">{error}</div>}

        {success && <div className="text-green-700">{success}</div>}

        <button type="submit" className="btn w-full">
            {isLoading ? "Đang tải..." : "Đăng nhập"}
        </button>

        <p className="text-center">
          Bạn chưa có tài khoản?{" "}
          <Link href={"/signup"} className="text-primaryColor">
            Đăng ký
          </Link>
        </p>
      </form>
    </section>
  );
};

export default LoginForm;
