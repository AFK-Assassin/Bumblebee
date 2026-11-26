import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bumblebee AI",
  description: "Your personal AI assistant powered by local LLMs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bee-dark text-bee-text font-mono antialiased h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}

