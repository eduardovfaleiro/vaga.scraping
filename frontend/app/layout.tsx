import type { Metadata } from 'next';
import './globals.css';
import GoogleOAuthWrapper from '@/components/GoogleOAuthWrapper';

export const metadata: Metadata = {
  title: 'Vagas',
  description: 'Plataforma de recomendação de vagas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-white text-zinc-900">
        <GoogleOAuthWrapper>{children}</GoogleOAuthWrapper>
      </body>
    </html>
  );
}
