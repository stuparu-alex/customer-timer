import './globals.css'
import 'react-image-gallery/styles/css/image-gallery.css';
import Layout from './components/Layout'

export const metadata = {
  title: 'Customer Timer App',
  description: 'Manage customer sessions and time slots efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
