import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer({ className } : { className ?: string }) {
  const t = await getTranslations("Footer");
  return (
    <footer className={cn("py-10 border-t border-border/50 bg-muted/30", className)}>
      <div className="container mx-auto px-4 flex flex-col gap-4">
        <div className="flex flex-col items-center md:flex-row justify-center gap-6">
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">{t("about_us")}</Link>
        </div>
        <p className="text-center text-muted-foreground text-sm">{t("copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}