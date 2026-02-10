"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import Image from "next/image";
import getFlagEmoji from "../utils/getFlagEmoji";

interface Country {
    name: string;
    code: string;
    dial_code: string;
}

interface ErrorField {
    message: string;
    field: string;
}

export default function SignInPage() {
    const [loginType, setLoginType] = useState<"email" | "phone">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errorField, setErrorField] = useState<ErrorField | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCountries = async () => {
            setError("");
            try {
                const response = await axiosInstance.get("/countries");
                if (response.data.success) {
                    const countryList = response.data.data || [];
                    setCountries(countryList);

                    const indonesia = countryList.find((c: Country) => c.code === "ID");
                    if (indonesia) {
                        setSelectedCountry(indonesia);
                    }
                }
            } catch (err: any) {
                setError("Gagal memuat daftar negara. Coba refresh.");
            }
        };

        fetchCountries();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorField(null);

        try {
            let payload: any = { password }; // password wajib

            if (loginType === "email") {
                if (!email) {
                    setLoading(false);
                    return;
                }
                payload.email = email;
            } else {
                if (!phone || !selectedCountry) {
                    setLoading(false);
                    return;
                }
                const fullPhone = `${selectedCountry.dial_code.replace("+", "")}${phone.replace(/\D/g, "")}`;
                payload.phone = fullPhone;
            }

            const response = await axiosInstance.post("/auth/login", payload);

            if (response.data.success) {
                const { otp, token, phone } = response.data.data;

                sessionStorage.setItem("temp_otp", otp);
                sessionStorage.setItem("temp_token", token.replace("Bearer ", ""));

                const redirectPath = `/confirm?phone=${phone}`

                router.push(redirectPath);
            }
        } catch (err: any) {
            setErrorField({
                message: err.response?.data?.message || "Gagal login. Periksa email/phone dan password.",
                field: err.response?.data?.data?.field || "email"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">
            <div className="relative h-screen w-1/2">
                <div className="absolute inset-0 bg-surface"></div>
                <Image
                    src="/assets/decorative_elements.png"
                    alt="Decorative background"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <Image
                    src="/assets/sing_in_illustration.png"
                    alt="Sign in illustration"
                    width={443}
                    height={0}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                    priority
                />
            </div>

            <div className="relative h-screen w-1/2">

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full max-w-[516]">
                        <div className="text-start">
                            <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
                            <p className="mt-2 text-gray-600">
                                Enter your Credentials to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <label className="block font-medium">{loginType === "email" ? "Email" : "Mobile Number"}</label>
                                    <button onClick={(e) => {
                                        e.preventDefault()
                                        setLoginType(loginType === "email" ? "phone" : "email")
                                    }} className="cursor-pointer text-primary hover:underline">
                                        Sign In with {loginType === "email" ? "Phone Number" : "Email"}
                                    </button>
                                </div>
                                {
                                    loginType === "email" ? <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value.trim())}
                                        placeholder="username@gmail.com"
                                        required
                                        className={`w-full px-4 py-[7] border ${errorField?.field === "email" ? "border-red-600" : "border-[#CDD5E9]"} rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                                    /> : <div className="relative">
                                        <select
                                            value={selectedCountry?.dial_code || ""}
                                            onChange={(e) => {
                                                const selected = countries.find((c) => c.dial_code === e.target.value);
                                                setSelectedCountry(selected || null);
                                            }}
                                            className="absolute w-20 px-3 py-[8]"
                                        >
                                            {countries.map((country) => (
                                                <option key={country.code} value={country.dial_code}>
                                                    {getFlagEmoji(country.code)} {country.dial_code}
                                                </option>
                                            ))}
                                        </select>

                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                            placeholder="Enter your number"
                                            required
                                            className={`w-full pl-24 px-4 py-[7] border ${errorField?.field === "phone" ? "border-red-600" : "border-[#CDD5E9]"} rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                                        />
                                    </div>
                                }

                            </div>

                            <div className="space-y-1">
                                <label className="block text-gray-700 font-medium text-sm">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className={`w-full px-4 py-[7] border ${errorField?.field === "password" ? "border-red-600" : "border-[#CDD5E9]"} rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                                    >
                                        <div className="cursor-pointer"> <Image
                                            src="/assets/show_hide.png"
                                            alt="Show Hide"
                                            width={24}
                                            height={0}
                                            className="object-contain"
                                            priority
                                        /></div>
                                    </button>

                                    <div className="absolute -bottom-6 flex justify-end">
                                        <a href="#" className="text-sm text-primary hover:underline">
                                            Forgot Password?
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="flex items-center justify-center cursor-pointer w-full mt-8 py-2 bg-primary text-white font-semibold rounded-sm hover:bg-primary-700 transition duration-200"
                            >
                                {
                                    loading ? <svg className="mr-3 -ml-1 size-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> :
                                        "Sign In"
                                }

                            </button>

                        </form>
                        {(error || errorField?.message) && (
                            <p className="absolute -bottom-14 w-full text-red-600 text-sm text-center bg-red-50 py-2 rounded-sm">
                                {error || errorField?.message}
                            </p>
                        )}
                    </div>
                </div>
            </div >
        </div >
    );
}



// <div className="min-h-screen flex items-center justify-center bg-background px-4">
//             <div className="w-full max-w-md p-8 bg-surfaces rounded-2xl shadow-xl border border-gray-200/50">
//                 <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Masuk ke Akun</h1>

//                 {/* Toggle Email / Phone */}
//                 <div className="flex mb-6 border-b border-gray-200">
//                     <button
//                         type="button"
//                         onClick={() => setLoginType("email")}
//                         className={`flex-1 py-3 text-center font-medium ${loginType === "email" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-foreground"
//                             }`}
//                     >
//                         Email
//                     </button>
//                     <button
//                         type="button"
//                         onClick={() => setLoginType("phone")}
//                         className={`flex-1 py-3 text-center font-medium ${loginType === "phone" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-foreground"
//                             }`}
//                     >
//                         Phone
//                     </button>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Input Email atau Phone */}
//                     {loginType === "email" ? (
//                         <div>
//                             <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
//                                 Email
//                             </label>
//                             <input
//                                 id="email"
//                                 type="email"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value.trim())}
//                                 placeholder="email@contoh.com"
//                                 required
//                                 autoFocus
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
//                             />
//                         </div>
//                     ) : (
//                         <div>
//                             <label className="block text-sm font-medium text-foreground/80 mb-2">
//                                 Nomor Telepon
//                             </label>
//                             <div className="flex">
//                                 <select
//                                     value={selectedCountry?.dial_code || ""}
//                                     onChange={(e) => {
//                                         const selected = countries.find((c) => c.dial_code === e.target.value);
//                                         setSelectedCountry(selected || null);
//                                     }}
//                                     className="w-28 px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
//                                 >
//                                     {countries.map((country) => (
//                                         <option key={country.code} value={country.dial_code}>
//                                             {country.dial_code} ({country.code})
//                                         </option>
//                                     ))}
//                                 </select>

//                                 <input
//                                     type="tel"
//                                     value={phone}
//                                     onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
//                                     placeholder="8123456789"
//                                     required
//                                     className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
//                                 />
//                             </div>
//                             <p className="text-xs text-gray-500 mt-1">
//                                 Contoh: +62 8123456789 (masukkan angka setelah kode negara)
//                             </p>
//                         </div>
//                     )}

//                     {/* Field Password (ditambahkan untuk kedua mode) */}
//                     <div>
//                         <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">
//                             Password
//                         </label>
//                         <input
//                             id="password"
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             placeholder="Masukkan password"
//                             required
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
//                         />
//                     </div>

//                     {error && (
//                         <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded">
//                             {error}
//                         </p>
//                     )}

//                     <button
//                         type="submit"
//                         disabled={
//                             loading ||
//                             (loginType === "email" ? !email : !phone || !selectedCountry) ||
//                             !password
//                         }
//                         className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-60 shadow-md"
//                     >
//                         {loading ? "Memproses..." : "Login"}
//                     </button>
//                 </form>
//             </div>
//         </div>