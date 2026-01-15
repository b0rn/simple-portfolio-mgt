import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer({ className } : { className ?: string }) {
  const t = await getTranslations("Footer");
  return (
    <footer className={cn("py-8 border-t bg-background", className)}>
      <div className="container mx-auto px-4 flex flex-col gap-4">
        <div className="flex flex-col items-center md:flex-row justify-center gap-4">
          <Link href="/about">{t("about_us")}</Link>
        </div>
        <p className="text-center text-muted-foreground">{t("copyright", { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}