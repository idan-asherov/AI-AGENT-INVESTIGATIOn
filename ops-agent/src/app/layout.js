import "./globals.css";

export const metadata = {
  title: "Ops Agent",
  description: "AI Agent for investigating bugs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#111111] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
