import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Sơn Nano | Dịch Vụ Sơn Nhà Chuyên Nghiệp",
  description: "Sơn Nano - Dịch vụ sơn nhà chuyên nghiệp hàng đầu Việt Nam. Sơn nội thất, ngoại thất, tư vấn màu sắc miễn phí.",
  keywords: ["sơn nhà", "dịch vụ sơn", "sơn nội thất", "sơn nano"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
