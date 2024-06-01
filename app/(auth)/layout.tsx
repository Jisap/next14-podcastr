
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <p className="text-white-1">LEFT SIDEBAR</p>
        {children}
      <p className="text-white-1">RIGHT SIDEBAR</p>
    </main>
    
  );
}