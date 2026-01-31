"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from 'zod';
import { components } from "@/lib/api/types/schema";
import { useMutation } from "@tanstack/react-query";
import { useApiClient } from "./api-client-provider";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

const formSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    name: z.string().min(1, t("name_required")).max(100, t("name_required"))
});

export type PortfolioFormData = z.infer<ReturnType<typeof formSchema>>;

export type PortfolioFormProps = {
    mode: "create" | "edit";
    initialFormData?: PortfolioFormData | null;
    onFormDataChange?: (data: PortfolioFormData) => void;
    portfolio?: components["schemas"]["PortfolioResponse"] | null
    onCreated?: () => void;
    onUpdated?: (portfolio ?: components["schemas"]["PortfolioResponse"]) => void;
};

export function PortfolioForm({
    mode,
    initialFormData,
    onFormDataChange,
    portfolio,
    onCreated,
    onUpdated,
    ...props
}: React.ComponentProps<"div"> & PortfolioFormProps) {
    const t = useTranslations("PortfolioForm");
    const client = useApiClient();

    const form = useForm<PortfolioFormData>({
        resolver: zodResolver(formSchema(t)),
        defaultValues: (() => {
            if (initialFormData) return initialFormData;
            return {
                name: ""
            };
        })()
    });

    const [errorTitle, setErrorTitle] = useState("");
    const [errorDescription, setErrorDescription] = useState("");

    const createPortfolioMutation = useMutation({
        mutationFn: ({ name }: { name: string }) => client.POST("/portfolios", {
            body: {
                name: name
            }
        }),
        onSuccess: ({ data, response, error }) => {
            if (response.status === 422) {
                setErrorTitle(t("create_failed"));
                setErrorDescription(t("create_failed_validation_error"));
            } else if (response.status === 500) {
                setErrorTitle(t("create_failed"));
                setErrorDescription(t("error_500"));
            } else if (response.status === 201) {
                toast.success(t("portfolio_created"));
                if (onCreated)
                    onCreated();
            }
        },
        onError: () => {
            setErrorTitle(t("create_failed"));
            setErrorDescription(t("error_500"));
        }
    })
    const updatePortfolioMutation = useMutation({
        mutationFn: ({ id, name }: { id: number, name?: string }) => client.PATCH("/portfolios/{portfolio_id}", {
            params: {
                path: {
                    portfolio_id: id
                }
            },
            body: {
                name: name
            }
        }),
        onSuccess: ({ data, response, error }) => {
            if (response.status === 422) {
                setErrorTitle(t("update_failed"));
                setErrorDescription(t("updated_failed_validation_error"));
            } else if (response.status === 500) {
                setErrorTitle(t("update_failed"));
                setErrorDescription(t("error_500"));
            } else if (response.status === 200) {
                toast.success(t("portfolio_updated"));
                if (onUpdated)
                    onUpdated(data);
            }
        },
        onError : () => {
            setErrorTitle(t("update_failed"));
            setErrorDescription(t("error_500"));
        }
    })

    const lastFormDataRef = useRef<PortfolioFormData | null>(null);
    const captureCurrentFormData = useCallback(() => {
        const currentValues = form.getValues();
        const formData: PortfolioFormData = {
            name: currentValues.name || ""
        };

        if (onFormDataChange) {
            onFormDataChange(formData);
        }
        return formData;
    }, [form, onFormDataChange]);



    // Watch for form changes and notify parent component
    useEffect(() => {
        const subscription = form.watch((value) => {
            if (onFormDataChange && value) {
                const formData: PortfolioFormData = {
                    name: value.name || ""
                };

                if (JSON.stringify(formData) !== JSON.stringify(lastFormDataRef.current)) {
                    lastFormDataRef.current = formData;
                    onFormDataChange(formData);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form, onFormDataChange]);

    // Reset form when initialFormData changes
    useEffect(() => {
        if (initialFormData && JSON.stringify(initialFormData) !== JSON.stringify(lastFormDataRef.current)) {
            lastFormDataRef.current = initialFormData;
            form.reset(initialFormData);
        }
    }, [initialFormData, form]);

    // Reset form when portfolio prop changes (for edit mode)
    useEffect(() => {
        if (mode === "edit" && portfolio && !initialFormData) {
            form.reset({
                name: portfolio.name
            });
        }
    }, [mode, portfolio, initialFormData, form]);

    // Reset form when switching from edit to create mode
    useEffect(() => {
        if (mode === "create" && !initialFormData) {
            form.reset({
                name: ""
            });
        }
    }, [mode, initialFormData, form]);

    useEffect(() => {
        (window as Window & { capturePortfolioFormData?: () => PortfolioFormData }).capturePortfolioFormData = captureCurrentFormData;

        return () => {
            delete (window as Window & { capturePortfolioFormData?: () => PortfolioFormData }).capturePortfolioFormData;
        }
    }, [captureCurrentFormData]);

    return (
        <div {...props}>
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
            <form
                onSubmit={form.handleSubmit(({ name }) => {
                    setErrorTitle("");
                    setErrorDescription("");
                    if (mode === "create")
                        createPortfolioMutation.mutate({ name: name });
                    else if (mode === "edit" && portfolio)
                        updatePortfolioMutation.mutate({ id: portfolio.id, name: name });
                })}
                className="flex flex-col gap-2"
            >
                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="portfolio-form-name">
                                {t("name")}
                            </FieldLabel>
                            <Input
                                {...field}
                                id="portfolio-form-name"
                                type="text"
                                aria-invalid={fieldState.invalid}
                                placeholder={t("name_placeholder")}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Button type="submit" className="w-full cursor-pointer flex-row items-center" disabled={createPortfolioMutation.isPending || updatePortfolioMutation.isPending}>
                    {createPortfolioMutation.isPending || updatePortfolioMutation.isPending ? <Spinner className="mr-2" /> : null}
                    {mode === "create" ? t("create") : t("edit")}
                </Button>
            </form>
        </div>
    )
}