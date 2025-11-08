import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext.jsx';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Collaborative Canvas Chat',
  description: 'Real-time collaborative drawing application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
