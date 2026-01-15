import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

export default function LocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-svh">
            <Navbar />
            <main className="flex grow">
                {children}
            </main>

            <Toaster />
            <Footer />
        </div>
    )
}