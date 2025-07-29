"use client";

import { useState } from "react";
import Image from "next/image";
import { BsPersonFill, BsLockFill } from "react-icons/bs";

export default function LoginFormPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No validation or auth logic here
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/images/pexels-pixabay-355887.jpg')" }}
    >
      {/* Logo above the form */}
      <div className="mb-8">
        <Image
          src="/images/EduLogo.png"
          alt="Logo"
          width={200}
          height={200}
          priority
        />
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-[20px] shadow-lg text-white rounded-xl p-8 sm:p-10"
      >
        <h1 className="text-4xl font-bold text-center mb-8">Login</h1>

        {/* Username Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-12 bg-transparent border border-white/20 rounded-full pl-12 pr-5 text-white placeholder-white text-lg outline-none transition focus:border-white"
          />
          <BsPersonFill className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl pointer-events-none" />
        </div>

        {/* Password Input */}
        <div className="relative mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 bg-transparent border border-white/20 rounded-full pl-12 pr-5 text-white placeholder-white text-lg outline-none transition focus:border-white"
          />
          <BsLockFill className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl pointer-events-none" />
        </div>

        {/* Remember Me and Forgot Password */}
        <div className="flex justify-between items-center mb-6 text-sm">
          <label className="flex items-center space-x-2 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
              className="accent-white"
            />
            <span>Remember me</span>
          </label>
          <a href="#" className="hover:underline">
            Forgot Password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-12 bg-white text-gray-800 rounded-full font-semibold shadow-md hover:scale-105 hover:drop-shadow-lg transition-transform duration-300"
        >
          Login
        </button>

        {/* Register Link */}
        <p className="text-center text-sm mt-6">
          Don't have an account?{" "}
          <a href="#" className="font-semibold hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
