import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import Feed from "@/components/Feed";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <div className="border-t border-zinc-800/40">
          <Feed />
        </div>
      </main>
      <Footer />
    </div>
  );
}
