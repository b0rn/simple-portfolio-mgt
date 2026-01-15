import { AppNavbar } from "@/components/app-navbar";
import { AuthGard } from "@/src/components/auth-guard";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({
    children
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="min-h-screen flex flex-col">
            <AuthGard>
                <AppNavbar />
                <main className="flex flex-grow">
                    {children}
                </main>

                <Toaster />
                <Footer />
            </AuthGard>
        </div>
    )
}