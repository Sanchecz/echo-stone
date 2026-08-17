import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Эхо Камня — сюжетное voxel-приключение";
const description =
  "Исследуйте живой блочный мир, добывайте ресурсы, стройте, сражайтесь с бурей и завершите историю Эха одним из двух финалов.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", base).toString();

  return {
    metadataBase: base,
    title,
    description,
    applicationName: "Эхо Камня",
    category: "game",
    keywords: ["voxel", "приключение", "браузерная игра", "строительство", "сюжетная игра"],
    authors: [{ name: "Echo Stone Studio" }],
    creator: "Echo Stone Studio",
    publisher: "Echo Stone Studio",
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    icons: {
      icon: [{ url: "/favicon.png", type: "image/png" }],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: "/",
      siteName: "Эхо Камня",
      title,
      description,
      images: [{ url: socialImage, width: 1200, height: 630, alt: "Эхо Камня — герой перед пробуждающимся сердцем voxel-мира" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07131d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
