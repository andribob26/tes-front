"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import Image from "next/image";

interface CryptoItem {
  id: string;
  name?: string;
  symbol?: string;
  image?: string;
  price_idr?: string;
  change_percent?: string;
  isPositive?: boolean;
  hot?: boolean;
  isFavorite?: boolean;
  type?: string;
}

const tabs = ["All", "Cryptocurrency", "Favorites", "Hot"];

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [cryptoList, setCryptoList] = useState<CryptoItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const handleFilterList = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = sessionStorage.getItem("tkn");
      if (!token) {
        router.replace("/signin");
      } else {
        setHasToken(true);
        fetchCryptoList();
      }
      setIsChecking(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [router]);

  const fetchCryptoList = async () => {
    setLoadingData(true);
    setError("");

    try {
      const response = await axiosInstance.get("/list-crypto");

      if (response.data.success) {
        setCryptoList(response.data.data || []);
      } else {
        setError(response.data.message || "Gagal memuat data crypto");
      }
    } catch (err: any) {
      if (err.response?.data?.status_code === 401) {
        sessionStorage.removeItem("tkn");
        router.replace("/signin");
      }
      const backendError = err.response?.data?.message;
      setError(backendError || "Terjadi kesalahan saat memuat list crypto");
    } finally {
      setLoadingData(false);
    }
  };

  const findCryptoById = (id: string) => {
    return cryptoList.find((crypto) => crypto.id === id)
  }

  useEffect(() => {
    if (cryptoList.length > 0) {
      setSelectedListId(cryptoList[0].id);
    }
  }, [cryptoList]);

  const filteredCrypto = useMemo(() => {
    let list = cryptoList;

    switch (activeTab) {
      case "Cryptocurrency":
        list = list.filter((item) => item.type === "cryptocurrency");
        break;
      case "Favorites":
        list = list.filter((item) => item.isFavorite);
        break;
      case "Hot":
        list = list.filter((item) => item.hot);
        break;
      default:
        break;
    }

    if (searchTerm) {
      list = list.filter(
        (item) =>
          item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.symbol?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return list;
  }, [cryptoList, activeTab, searchTerm]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Memeriksa autentikasi...</div>
      </div>
    );
  }

  if (!hasToken) return null;

  return (
    <div className="flex h-screen overflow-y-hidden">
      <aside className="w-[379] bg-surface">
        <div className="py-5 px-3">
          <div className="space-y-6 px-4">
            <h2 className="text-2xl font-bold">Markets</h2>
            <div className="relative">
              <input
                type={"text"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                required
                className={`w-full px-4 py-[11] bg-background border border-[#CDD5E9] rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <div className="cursor-pointer">
                  {" "}
                  <Image
                    src="/assets/search.png"
                    alt="Search"
                    width={24}
                    height={0}
                    className="object-contain"
                    priority
                  />
                </div>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className=" mt-6 mb-6 w-[calc(100%-40px)] flex overflow-x-auto text-sm font-medium">
              {tabs.map((tab) => {
                return (
                  <button
                    key={tab}
                    onClick={() => handleFilterList(tab)}
                    className={`cursor-pointer px-6 py-2.5 whitespace-nowrap font-semibold ${tab === activeTab
                      ? "border-b-2 border-primary text-primary"
                      : "border-b-2 border-[#CDD5E9] hover:text-primary"
                      }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            <div className="absolute p-2 bottom-0 right-0 bg-surface">
              {" "}
              <Image
                src="/assets/short_arrow.png"
                alt="Short Arrow"
                width={24}
                height={0}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="space-y-4 h-[calc(100vh-214px)] pr-4 overflow-y-scroll">
            {
              error !== "" && <div>{error}</div>
            }
            {
              loadingData ? <div>Loading...</div> : filteredCrypto.length > 0 ? filteredCrypto.map((crypto) => (
                <div
                  key={crypto.id}
                  onClick={() => setSelectedListId(crypto.id)}
                  className={`cursor-pointer flex items-center justify-between p-[14] ${selectedListId === crypto.id ? "bg-primary text-background" : "bg-[#D4D4D4]"} rounded-sm border border-[#CDD5E9]`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xs overflow-hidden bg-background border border-[#CDD5E9]">
                      {crypto.image ? (
                        <Image
                          src={crypto.image}
                          alt={crypto.name || crypto.symbol || ""}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary">
                          {crypto.symbol?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div className="h-10 flex flex-col justify-between">
                      <h4 className="font-semibold text-sm">{crypto.symbol} {crypto.hot && "🔥"}</h4>
                      <p className="text-xs">
                        {crypto.name ?? "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-sm gap-1">
                    <div className="bg-background w-fit p-0.5">
                      <p
                        className={
                          crypto.isPositive ? "text-green-600" : "text-red-600"
                        }
                      >
                        {crypto.change_percent || "0"}
                      </p>
                    </div>
                    <p className="block font-medium">{crypto.price_idr || "0"}</p>
                  </div>
                </div>
              )) : searchTerm && <div className="text-xs">We couldn’t find ‘Sponsora.’ Try searching with a different keyword.</div>
            }
          </div>
        </div>
      </aside>

      <main className="flex-1 p-3">
        <div className="mt-[69] mb-8 flex items-center gap-4">
          <div className="w-[40] h-[40] overflow-hidden">
            <Image
              src="/assets/avatar.png" // ganti dengan avatar real
              alt="John Johnson"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <span className="font-semibold text-3xl">John Johnson</span>
        </div>
        <hr className="border-gray-300 mb-4" />
        <h1 className="text-2xl mb-4 font-semibold">
          Welcome to Trading Dashboard
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {selectedListId &&
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xs overflow-hidden bg-background border border-[#CDD5E9]">
                  {findCryptoById(selectedListId)?.image ? (
                    <Image
                      src={findCryptoById(selectedListId)?.image || ""}
                      alt={findCryptoById(selectedListId)?.name || findCryptoById(selectedListId)?.symbol || ""}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary">
                      {findCryptoById(selectedListId)?.symbol?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{findCryptoById(selectedListId)?.symbol ?? "-"}</h3>
                </div>
                <div>
                  <p className={`${findCryptoById(selectedListId)?.isPositive ? "text-green-600" : "text-red-600"}`}>{findCryptoById(selectedListId)?.price_idr || "0"}</p>
                  <p className={`${findCryptoById(selectedListId)?.isPositive ? "text-green-600" : "text-red-600"}`}>{findCryptoById(selectedListId)?.change_percent || "0"}</p>
                </div>
              </div>

            </div>
          }
        </div>
      </main>
    </div>
  );
}
