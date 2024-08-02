import "@/app/ui/global.css"
import { inter } from "@/app/ui/fonts"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ptbr">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
