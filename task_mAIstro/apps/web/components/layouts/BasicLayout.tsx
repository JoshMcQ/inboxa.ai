import { Footer } from "@/app/(landing)/home/Footer";
import { Header } from "@/app/(landing)/home/Header";

export function BasicLayout(props: { children: React.ReactNode }) {
  return (
    <div className="bg-white min-h-screen">
      <Header />
      <main className="isolate pt-16">{props.children}</main>
      <Footer />
    </div>
  );
}
