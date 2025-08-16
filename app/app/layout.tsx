import { Header } from "@/components/app/header";

export default function AppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div>
      <Header />
    </div>
  );
}
