"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import formatPhoneNumber from "../utils/formatPhoneNumber";
import Image from "next/image";

export default function ConfirmPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const phone = searchParams.get("phone") || "";
    const [otpInput, setOtpInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (otpInput.length !== 6) {
            setError("Masukkan 6 digit OTP yang valid");
            setLoading(false);
            return;
        }

        try {
            const token = sessionStorage.getItem("temp_token");
            const response = await axiosInstance.post("/auth/verify-otp", {
                phone,
                otp: otpInput,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                sessionStorage.removeItem("temp_otp");
                sessionStorage.removeItem("temp_token");

                if (token) {
                    sessionStorage.setItem("tkn", token)
                }

                router.replace("/");
            } else {
                setError(response.data.message || "Verifikasi OTP gagal");
            }
        } catch (err: any) {
            const backendError = err.response?.data?.message;
            setError(
                backendError ||
                "Terjadi kesalahan saat verifikasi. Coba lagi atau periksa koneksi."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const otp = sessionStorage.getItem("temp_otp");
        setOtpInput(otp ?? "")
    }, [])

    useEffect(() => {
        if (!phone) {
            router.replace("/signin");
        }
    }, [phone, router]);


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
                    src="/assets/confirm_illustration.png"  
                    alt="Confirm illustration"
                    width={443}
                    height={0}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-contain"
                    priority
                />
            </div>

            <div className="relative h-screen w-1/2">

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full max-w-[360]">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900">Confirm your phone</h1>
                            <p className="mt-2 text-gray-600">
                                We send 6 digits code to{" "}
                                <span>
                                    {formatPhoneNumber(phone)}
                                </span>
                            </p>
                        </div>

                        <form onSubmit={handleVerify} className="mt-6 space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-center gap-3 sm:gap-4 mt-8">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-center bg-surface w-[50] h-[72] p-2 border border-[#CDD5E9] rounded-md overflow-hidden"
                                        >
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                pattern="\d*"
                                                value={otpInput[index] || ''}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const val = e.target.value;
                                                    if (!/^\d?$/.test(val)) return;

                                                    const newOtp = otpInput.split('');
                                                    newOtp[index] = val;
                                                    setOtpInput(newOtp.join(''));

                                                    if (val && index < 5) {
                                                        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                                                        nextInput?.focus();
                                                    }
                                                }}
                                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                    if (e.key === 'Backspace' && !otpInput[index] && index > 0) {
                                                        e.preventDefault();
                                                        const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
                                                        prevInput?.focus();
                                                    }
                                                }}
                                                onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                                                    e.preventDefault();
                                                    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                                                    if (paste.length > 0) {
                                                        setOtpInput(paste.padEnd(6, ''));
                                                        if (paste.length === 6) {
                                                            const lastInput = document.querySelector(`input[data-index="5"]`) as HTMLInputElement;
                                                            lastInput?.focus();
                                                        } else {
                                                            const nextInput = document.querySelector(`input[data-index="${paste.length}"]`) as HTMLInputElement;
                                                            nextInput?.focus();
                                                        }
                                                    }
                                                }}
                                                data-index={index}
                                                className={`h-full w-full text-4xl font-bold text-center text-primary border-b-2 ${otpInput[index] ? 'border-primary' : 'border-gray-300'} focus:border-primary focus:outline-none focus:bg-purple-50/20 transition-all duration-200 rounded-t-md`}
                                                autoComplete="one-time-code"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>



                            <button
                                type="submit"
                                className="flex items-center justify-center cursor-pointer w-full mt-8 py-2 bg-primary text-white font-semibold rounded-sm hover:bg-primary-700 transition duration-200"
                            >
                                {
                                    loading ? <svg className="mr-3 -ml-1 size-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> :
                                        "Confirm"
                                }

                            </button>

                        </form>
                        {(error) && (
                            <p className="absolute -bottom-14 w-full text-red-600 text-sm text-center bg-red-50 py-2 rounded-sm">
                                {error}
                            </p>
                        )}


                    </div>
                </div>
            </div >
        </div >
    );
}
