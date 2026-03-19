import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harpia — Pesquisa TCC",
  description: "Formulário de pesquisa para Trabalho de Conclusão de Curso",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
