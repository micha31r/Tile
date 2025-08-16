import { Header } from "@/components/app/header";

export default function AppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Header />
      {children}
    </div>
  );
}
