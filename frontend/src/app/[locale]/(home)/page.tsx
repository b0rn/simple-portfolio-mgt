import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
    const t = await getTranslations("HomePage");

    return (
        <div className='flex flex-col justify-center items-center grow gap-4'>
            <h1 className='text-2xl font-bold'>{t("title")}</h1>
            <p className='text-lg font-medium'>{t("description")}</p>
            <div className='flex flex-row gap-2'>
                <Button asChild className='text-lg font-semibold'>
                    <Link href={"/auth/login"}>
                        {t("login")}
                    </Link>
                </Button>
                <Button asChild className='text-lg font-semibold'>
                    <Link href={"/auth/signup"}>
                        {t("sign_up")}
                    </Link>
                </Button>
            </div>
        </div>
    )
}