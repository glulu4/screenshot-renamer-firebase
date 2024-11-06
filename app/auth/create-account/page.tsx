// "use client";
// import Link from "next/link";
// import React, {useState} from "react";
// import {createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword} from "firebase/auth";
// import {User} from "app/types/types";

// export default function Page() {
//     const [name, setName] = useState<string>("");
//     const [email, setEmail] = useState<string>("");
//     const [password, setPassword] = useState<string>("");
//     const auth = getAuth();

//     function createTestUser(uid:string, name:string, email:strin ){


//         const user:User = {
//             uid,
//             name
//         }

//     }
//     const handleCreateAccount = async () => {
//         // Logic to create an account goes here
//         console.log("Creating account with:", {name, email, password});



//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         const newUser = createTestUser(user.uid, name, email);
//         const addedUser: User | null = await addNewUser(newUser); // adds user to firestore

//         console.log('Response', addedUser);
//         if (!addedUser) throw new Error("User object came back null");

//     };

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50">
//             <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
//                 <h1 className="text-3xl font-bold text-center text-gray-900">Create Account</h1>

//                 <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
//                     <div>
//                         <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                             Name
//                         </label>
//                         <input
//                             type="text"
//                             id="name"
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                             className="w-full mt-1 p-2 border border-gray-300 rounded"
//                             placeholder="Your name"
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                             Email
//                         </label>
//                         <input
//                             type="email"
//                             id="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="w-full mt-1 p-2 border border-gray-300 rounded"
//                             placeholder="Your email"
//                         />
//                     </div>

//                     <div>
//                         <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                             Password
//                         </label>
//                         <input
//                             type="password"
//                             id="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="w-full mt-1 p-2 border border-gray-300 rounded"
//                             placeholder="Your password"
//                         />
//                     </div>

//                     <button
//                         onClick={handleCreateAccount}
//                         className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                     >
//                         Create Account
//                     </button>
//                     <Link href='/auth/sign-in'>
//                         <p>Already have an Account? Sign In</p>
//                     </Link>
//                 </form>
//             </div>
//         </div>
//     );
// }

"use client";
import Link from "next/link";
import React, {useState} from "react";
import {createUserWithEmailAndPassword, getAuth} from "firebase/auth";
import {User, UserDataOnRegister} from "app/types/types"; // Adjust import path as needed
// import {addNewUser} from "path/to/firestore-functions"; // Add your function to add user to Firestore
import {useRouter} from "next/navigation";
import {Timestamp} from 'firebase/firestore';
import {addNewUser} from "app/cloudfns/addFns";
import {message} from "antd";
import {useAuth} from "app/context/AuthContext";

export default function Page() {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const auth = getAuth();
    const router = useRouter();
    const {register} = useAuth();



    const handleCreateAccount = async () => {
        try {

            const userData: UserDataOnRegister = {
                firstName,
                lastName,
            }

            // addes user to firebase auth and firstore, sets global state
            register(email, password, userData);
            message.success("Account created successfully!");
            router.push("/account"); // Redirect to account page
        } catch (error: any) {
            console.error("Error creating account:", error);
            setError(error.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-center text-gray-900">Create Account</h1>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            placeholder="Your first name"
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            placeholder="Your last name"
                        />
                    </div>

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
                        onClick={handleCreateAccount}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        Create Account
                    </button>

                    <div className="text-center">
                        <Link href="/auth/sign-in">
                            <p className="text-blue-500 hover:underline">Already have an Account? Sign In</p>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
