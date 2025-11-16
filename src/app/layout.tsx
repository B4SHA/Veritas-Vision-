import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';
import { Inter } from 'next/font/google';
import { PageWrapper } from '@/components/page-wrapper';
import { LanguageProvider } from '@/context/language-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Veritas Vision',
  description: 'In an ocean of digital noise,Veritas Vision is your anchor for truth.Our essential AI-powered toolkit empowers you to critically analyze news,video, and audio content, navigating the online world with clarity and confidence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", inter.variable)} suppressHydrationWarning>
      <head />
      <body className={cn("font-body antialiased h-full flex flex-col")}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          <LanguageProvider>
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center">
              <PageWrapper>{children}</PageWrapper>
            </main>
            <footer className="py-6 md:px-8 md:py-0 border-t">
              <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
                  Built With ❤️ By Team Veritas Vision | 
                   AI may produce inaccurate information |
                    <a href="https://www.instagram.com/basha_immortal/" target="_blank"> Instagram </a> | 
                    <a href="https://github.com/B4SHA" target="_blank">Github</a>
                </p>
              </div>
            </footer>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
