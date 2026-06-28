import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import SmoothScroll from "../components/providers/SmoothScroll";
import { getSiteSettingsCached } from "../lib/cms-queries";

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

/**
 * Next.js dynamic metadata generator feeding SEO details from CMS DB
 */
export async function generateMetadata() {
  const settings = await getSiteSettingsCached();

  const title =
    settings?.metaTitle ||
    "Arcyl Media — Premium Digital Marketing, Web Design & AI Automation Agency";
  const description =
    settings?.metaDescription ||
    "Arcyl Media transforms your digital vision into stunning reality. We drive explosive growth with elite digital marketing, web engineering, and AI automation.";
  const ogImg = settings?.openGraphImage || "/logo-hero.png";

  return {
    title,
    description,
    keywords: [
      "digital marketing",
      "website design",
      "web development",
      "AI automation",
      "branding",
      "performance marketing",
      "Arcyl Media",
    ],
    authors: [{ name: settings?.companyName || "Arcyl Media" }],
    metadataBase: new URL("https://arcylmedia.com"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      images: [{ url: ogImg }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImg],
    },
    icons: {
      icon: settings?.favicon || "/favicon.ico",
      shortcut: settings?.favicon || "/favicon.ico",
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettingsCached();

  return (
    <html lang="en" className={`${inter.variable} ${dmSerifDisplay.variable}`}>
      <body className="bg-dark text-white font-body antialiased">
        <SmoothScroll>
          <Navbar settings={settings} />
          <main className="min-h-screen">{children}</main>
          <Footer settings={settings} />
        </SmoothScroll>
      </body>
    </html>
  );
}
