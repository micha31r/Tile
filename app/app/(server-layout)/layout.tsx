import { Header } from "@/components/app/header";

export default function ServerLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <Header />
      {children}
    </div>
  );
}
