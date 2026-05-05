import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';

export const metadata: Metadata = {
  title: 'TukTuk & Run Machine Academy | IPL 2026 The Pavilion of Patience',
  description: 'The official home of cricket\'s slowest batters and most expensive bowlers. TukTuk Academy & Run Machine Academy â€” celebrating bad cricket since 2024.',
  keywords: ['TukTuk Academy', 'Run Machine Academy', 'IPL cricket', 'cricket stats', 'strike rate', 'economy rate', 'IPL 2026'],
  openGraph: {
    title: 'TukTuk & Run Machine Academy',
    description: 'Ranking the slowest and most expensive IPL players',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
