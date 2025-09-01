import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { defaultMetadata } from './metadata';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from "./components/Errorboundary";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = defaultMetadata;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}> 
          {/* <ErrorBoundary> */}
        <Navbar />
          {children}
        <Footer /> 
          <Toaster position="top-right" />
          {/* </ErrorBoundary> */}
      </body>
    </html>
  );
}
