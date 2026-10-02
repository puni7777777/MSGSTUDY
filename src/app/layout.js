import './globals.css';

export const metadata = {
  title: 'The Teardown Lab | FailForward ME',
  description:
    'Interactive physics-first mechanical engineering sandbox and destructive testing platform. Build, tweak, and break trusses, beams, linkages, and mechanisms.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark min-h-full bg-slate-950 text-slate-100 antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
