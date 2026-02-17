
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using proper Next.js font
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Manti ERP",
    description: "Enterprise SaaS ERP System",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
