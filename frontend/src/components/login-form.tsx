"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import {
    Field,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useApiClient } from "./api-client-provider";
import { useState } from "react";

const formSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    email: z.email(t("email_required")),
    password: z.string().min(12, t("password_error")).max(128, t("password_error"))
})

export interface ILoginForm {
    errorTitle?: string;
    errorDescription?: string;
}

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div"> & ILoginForm) {
    const t = useTranslations('LoginForm');
    const client = useApiClient();
    const router = useRouter();
    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema(t)),
        defaultValues : {
            email : "",
            password : ""
        }
    });
    const [errorTitle, setErrorTitle] = useState("");
    const [errorDescription, setErrorDescription] = useState("");

    const loginMutation = useMutation({
        mutationFn: ({ email, password }: { email: string, password: string }) => {
            return client.POST("/auth/login", {
                body: {
                    email: email,
                    password: password
                }
            });
        },
        onSuccess: ({ data, response, error }) => {
            if (response.status === 401) {
                setErrorTitle(t("login_failed"));
                setErrorDescription(t("login_failed_unauthorized"))
            } else if (response.status === 422) {
                setErrorTitle(t("login_failed"));
                setErrorDescription(t("login_failed_validation_error"))
            } else if (response.status >= 500) {
                setErrorTitle(t("login_failed"));
                setErrorDescription(t("error_500"));
            } else if (response.status === 200) {
                router.replace("/app/portfolios");
            }
        }
    })
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form
                        className="p-6 md:p-8"
                        onSubmit={
                            form.handleSubmit(({ email, password }) => {
                                loginMutation.mutate({ email: email, password: password })
                            })
                        }
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center gap-2">
                                <h1 className="text-2xl font-bold">{t("form_title")}</h1>
                                <p className="text-muted-foreground text-balance">
                                    {t("form_description")}
                                </p>
                            </div>
                            {
                                errorTitle &&
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertTitle>{errorTitle}</AlertTitle>
                                    {
                                        errorDescription &&
                                        <AlertDescription>
                                            <p>{errorDescription}</p>
                                        </AlertDescription>
                                    }

                                </Alert>
                            }
                            <div className="grid gap-3">
                                <Controller
                                    name="email"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel htmlFor="login-form-email">
                                                {t("email")}
                                            </FieldLabel>
                                            <Input
                                                {...field}
                                                id="login-form-email"
                                                type="email"
                                                aria-invalid={fieldState.invalid}
                                                placeholder="m@example.com"
                                            />
                                            {fieldState.invalid && (
                                                <FieldError errors={[fieldState.error]} />
                                            )}
                                        </Field>
                                    )}
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Controller
                                        name="password"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <Field data-invalid={fieldState.invalid}>
                                                <div className="flex flex-row">
                                                    <FieldLabel htmlFor="login-form-password">
                                                        {t("password")}
                                                    </FieldLabel>
                                                    <Link
                                                        href="/auth/recover"
                                                        className="ml-auto text-sm underline-offset-2 hover:underline"
                                                    >
                                                        {t("forgot_password")}
                                                    </Link>
                                                </div>
                                                <Input
                                                    {...field}
                                                    id="login-form-password"
                                                    type="password"
                                                    aria-invalid={fieldState.invalid}
                                                />
                                                {
                                                    fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]} />
                                                    )
                                                }
                                            </Field>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full cursor-pointer" disabled={loginMutation.isPending}>
                                {t("login")}
                            </Button>
                            <div className="text-center text-sm">
                                {t("dont_have_an_account")}{" "}
                                <Link href="/auth/signup" className="underline underline-offset-4">
                                    {t("sign_up")}
                                </Link>
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/10 p-8">
                        <div className="rounded-2xl bg-background/30 backdrop-blur-sm p-6 ring-1 ring-white/10">
                            <Image
                                src="/logo.svg"
                                alt="Image"
                                className="h-24 w-24 opacity-80"
                                width={96}
                                height={96}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
