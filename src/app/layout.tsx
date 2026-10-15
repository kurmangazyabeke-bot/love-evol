import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f43f5e" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://love-evol.vercel.app"
  ),
  title: {
    default: "LoveEvol — Конструктор романтических приглашений на свидание",
    template: "%s | LoveEvol",
  },
  description:
    "Создайте интерактивное приглашение на свидание: живые вайб-градиенты, уклоняющаяся кнопка «Нет», выбор активностей, фотоальбом и секретные послания. Ссылка, от которой невозможно отказаться!",
  keywords: [
    "приглашение на свидание",
    "валентинка",
    "романтический сюрприз",
    "конструктор приглашений",
    "интерактивная открытка",
    "свидание",
    "LoveEvol",
    "любовь",
  ],
  authors: [{ name: "LoveEvol Team" }],
  creator: "LoveEvol",
  publisher: "LoveEvol",
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
  },
  openGraph: {
    title: "LoveEvol — Конструктор романтических приглашений на свидание 💖",
    description:
      "Создайте интерактивное свидание с живыми градиентами, уклоняющейся кнопкой «Нет» и фотоальбомом. Ваша половинка обязательно скажет ДА!",
    url: "/",
    siteName: "LoveEvol",
    locale: "ru_RU",
    type: "website",
    images: [
      {
        url: "/api/og?title=LoveEvol%20%E2%80%94%20%D0%9F%D1%80%D0%B8%D0%B3%D0%BB%D0%B0%D1%81%D0%B8%20%D0%BD%D0%B0%20%D1%81%D0%B2%D0%B8%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5%20%F0%9F%92%96&subtitle=%D0%A1%D0%BE%D0%B7%D0%B4%D0%B0%D0%B9%D1%82%D0%B5%20%D0%BC%D0%B0%D0%B3%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D1%83%D1%8E%20%D0%BE%D1%82%D0%BA%D1%80%D1%8B%D1%82%D0%BA%D1%83%20%D1%81%20%D1%83%D0%B1%D0%B5%D0%B3%D0%B0%D1%8E%D1%89%D0%B5%D0%B9%20%D0%BA%D0%BD%D0%BE%D0%BF%D0%BA%D0%BE%D0%B9%20%C2%AB%D0%9D%D0%B5%D1%82%C2%BB",
        width: 1200,
        height: 630,
        alt: "LoveEvol — Конструктор романтических приглашений",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoveEvol — Конструктор романтических приглашений на свидание 💖",
    description:
      "Создайте интерактивное приглашение на свидание, от которого невозможно отказаться!",
    images: [
      "/api/og?title=LoveEvol%20%E2%80%94%20%D0%9F%D1%80%D0%B8%D0%B3%D0%BB%D0%B0%D1%81%D0%B8%20%D0%BD%D0%B0%20%D1%81%D0%B2%D0%B8%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5%20%F0%9F%92%96&subtitle=%D0%A1%D0%BE%D0%B7%D0%B4%D0%B0%D0%B9%D1%82%D0%B5%20%D0%BC%D0%B0%D0%B3%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D1%83%D1%8E%20%D0%BE%D1%82%D0%BA%D1%80%D1%8B%D1%82%D0%BA%D1%83%20%D1%81%20%D1%83%D0%B1%D0%B5%D0%B3%D0%B0%D1%8E%D1%89%D0%B5%D0%B9%20%D0%BA%D0%BD%D0%BE%D0%BF%D0%BA%D0%BE%D0%B9%20%C2%AB%D0%9D%D0%B5%D1%82%C2%BB",
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
