import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { FullscreenProvider } from "@/contexts/fullscreen-context"

// Define the Inter font
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FullscreenProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </FullscreenProvider>
      </body>
    </html>
  )
}


import './globals.css'