export default function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-gradient-to-b dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
