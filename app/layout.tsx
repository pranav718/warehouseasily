import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "warehouseasily | Autonomous Warehouse Fleet Visualizer",
  description: "Autonomous warehouse fleet navigation and pick-order optimization system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-warehouse-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
