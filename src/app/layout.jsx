import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/providers/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata = {
  title: "Arcyl Media — Premium Digital Marketing, Web Design & AI Automation Agency",
  description:
    "Arcyl Media transforms your digital vision into stunning reality. We drive explosive growth and help you dominate your market with elite digital marketing, premium website design & development, and powerful AI automation.",
  keywords: [
    "digital marketing",
    "website design",
    "web development",
    "AI automation",
    "branding",
    "performance marketing",
    "Arcyl Media",
  ],
  authors: [{ name: "Arcyl Media" }],
  openGraph: {
    title: "Arcyl Media — Premium Digital Marketing, Web Design & AI Automation Agency",
    description:
      "Transforming your digital vision into reality with elite digital marketing, premium web engineering, and powerful AI automation.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerifDisplay.variable}`}>
      <body className="bg-dark text-white font-body antialiased">
        <SmoothScroll>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
