"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {useAuth} from "../../context/AuthContext"; // Adjust this path if needed
import {message} from "antd";

export default function Page() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const router = useRouter();
    const {login, state} = useAuth(); // Using login function and state from AuthContext

    const handleSignIn = async () => {
        try {
            await login(email, password); // Attempt to sign in using login from AuthContext
            message.success("Signed in successfully!");
            router.push("/account"); // Redirect to account page on successful login
        } catch (error) {
            message.error("Failed to sign in. Please check your credentials.");
            console.error("Sign-in error:", error);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-900">Sign In</h1>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            placeholder="Your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            placeholder="Your password"
                        />
                    </div>

                    <button
                        onClick={handleSignIn}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Sign In
                    </button>

                    <div className="text-center">
                        <Link href="/auth/create-account">
                            <p className="text-blue-500 hover:underline">Don't have an account? Create one</p>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
