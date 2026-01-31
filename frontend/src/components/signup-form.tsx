"use client";

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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import zxcvbn from "zxcvbn";
import { AlertCircleIcon } from "lucide-react";
import Image from "next/image";
import { useApiClient } from "./api-client-provider";
import { useMutation } from "@tanstack/react-query";

const formSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    email: z.email(t("email_required")),
    password: z.string().min(12, t("password_error")).max(128, t("password_error")),
    confirmPassword: z.string().min(12, t("confirm_password_error")).max(128, t("confirm_password_error"))
})


export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const t = useTranslations('SignupForm');
    const client = useApiClient();
    const router = useRouter();
    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema(t)),
    })
    const [password, setPassword] = useState("");
    const [passwordScore, setPasswordScore] = useState<number | undefined>(undefined);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [errorTitle, setErrorTitle] = useState("");
    const [errorDescription, setErrorDescription] = useState("");

    const registerMutation = useMutation({
        mutationFn : ({ email, password }  : {email : string, password : string } ) => {
            return client.POST("/auth/register", {
                body : {
                    email : email,
                    password : password
                }
            });
        },
        onSuccess : ({ data, response, error }) => {
            if (response.status === 409) {
                setErrorTitle(t("signup_failed"));
                setErrorDescription(t("signup_failed_duplicate_email"));
            } else if(response.status >= 400 && response.status < 500) {
                setErrorTitle(t("signup_failed"));
                setErrorDescription(t("signup_failed_description"));
            } else if (response.status >= 500) {
                setErrorTitle(t("signup_failed"));
                setErrorDescription(t("error_500"));
            } else if(response.status === 201) {
                router.replace("/app/portfolios");
            }
        },
        onError : (data) => {
            console.log("error", data.message)
        }
    })

    useEffect(() => {
        if (confirmPassword === "")
            setConfirmPasswordError(false)
        else
            setConfirmPasswordError(confirmPassword !== password)
    }, [password, confirmPassword]);

    useEffect(() => {
        if (password === "") {
            setPasswordScore(undefined);
            return;
        }
        const strength = zxcvbn(password);
        switch (strength.score) {
            case 0:
                setPasswordScore(1)
                break;
            case 1:
                setPasswordScore(15)
                break;
            case 2:
                setPasswordScore(33);
                break;
            case 3:
                setPasswordScore(66);
                break;
            case 4:
                setPasswordScore(100);
                break;
        }
    }, [password]);

    let progressIndicatorClassName = "", passwordStrengthText = "";
    if (passwordScore !== undefined) {
        if (passwordScore < 33) {
            progressIndicatorClassName = "bg-red-500";
            passwordStrengthText = t("password_weak");
        } else if (passwordScore === 33) {
            progressIndicatorClassName = "bg-amber-500";
            passwordStrengthText = t("password_fair");
        } else if (passwordScore === 66) {
            progressIndicatorClassName = "bg-green-300";
            passwordStrengthText = t("password_good");
        } else if (passwordScore === 100) {
            progressIndicatorClassName = "bg-green-500";
            passwordStrengthText = t("password_strong");
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form
                        className="p-6 md:p-8"
                        onSubmit={
                            form.handleSubmit(({ email, password }) => {
                                registerMutation.mutate({ email : email, password : password});
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
                            {errorTitle &&
                                <Alert variant="destructive">
                                    <AlertCircleIcon />
                                    <AlertTitle>{errorTitle}</AlertTitle>
                                    {errorDescription &&
                                        <AlertDescription>
                                            <p>{errorDescription}</p>
                                        </AlertDescription>
                                    }
                                </Alert>}
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="signup-form-email">
                                            {t("email")}
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="signup-form-email"
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
                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="signup-form-password">
                                            {t("password")}
                                        </FieldLabel>
                                        {passwordScore !== undefined &&
                                            <div className="flex flex-col gap-2">
                                                <p className="font-bold text-xs">{passwordStrengthText}</p>
                                                <Progress
                                                    value={passwordScore}
                                                    indicatorClassName={progressIndicatorClassName}
                                                />
                                            </div>

                                        }
                                        <Input
                                            {...field}
                                            id="signup-form-password"
                                            type="password"
                                            aria-invalid={fieldState.invalid}
                                            onChange={(v) => {
                                                setPassword(v.currentTarget.value);
                                                field.onChange(v);
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name="confirmPassword"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="">
                                            {t("confirm_password")}
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="signup-form-confirm-password"
                                            type="password"
                                            aria-invalid={fieldState.invalid}
                                            onChange={(v) => {
                                                setConfirmPassword(v.currentTarget.value);
                                                field.onChange(v);
                                            }}
                                            className={confirmPasswordError ? "border-red-500 border" : ""}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Button type="submit" className="w-full cursor-pointer" disabled={registerMutation.isPending || confirmPasswordError}>
                                {t("sign_up")}
                            </Button>
                            <div className="text-center text-sm">
                                {t("already_have_account")}{" "}
                                <Link href="/auth/login" className="underline underline-offset-4">
                                    {t("sign_in")}
                                </Link>
                            </div>
                        </div>
                    </form>
                    <div className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-secondary/20 via-primary/15 to-secondary/10 p-8">
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
