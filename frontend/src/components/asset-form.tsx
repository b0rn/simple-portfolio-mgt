"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import {
    Field,
    FieldError,
    FieldLabel
} from "@/components/ui/field";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "./api-client-provider";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Combobox } from "./combobox";
import { Spinner } from "./ui/spinner";
import { Popover } from "./ui/popover";

const formSchema = (t: ReturnType<typeof useTranslations>) => z.object({
    symbol: z.string().min(1, t("symbol_required")).max(16, t("symbol_required")),
    quantity: z.preprocess<number, z.ZodNumber, number>(a => parseFloat(z.string().parse(a)), z.number().positive().min(0.0000000001, t("quantity_required")))
});

export type AssetFormData = z.infer<ReturnType<typeof formSchema>>;
export type AssetFormProps = {
    portfolioId: number;
    onCreated?: () => void;
    popoverProps?: React.ComponentProps<typeof Popover>;
};

export function AssetForm({
    portfolioId,
    onCreated,
    popoverProps,
    ...props
}: React.ComponentProps<"div"> & AssetFormProps) {
    const t = useTranslations("AssetForm");
    const client = useApiClient();
    const queryClient = useQueryClient();

    const form = useForm<AssetFormData>({
        resolver: zodResolver(formSchema(t))
    });

    const [errorTitle, setErrorTitle] = useState("");
    const [errorDescription, setErrorDescription] = useState("");

    const getPricesQuery = useQuery({
        queryKey: ["prices"],
        queryFn: () => client.GET("/prices")
    });
    const createAssetMutation = useMutation({
        mutationFn: ({ symbol, quantity }: { symbol: string, quantity: number }) => client.POST("/portfolios/{portfolio_id}/assets", {
            params: {
                path: {
                    portfolio_id: portfolioId
                },
            },
            body: {
                symbol: symbol,
                quantity: quantity
            }
        }),
        onSuccess: ({ data, response, error }) => {
            if (response.status === 422) {
                setErrorTitle(t("create_failed"));
                setErrorDescription(t("create_failed_validation_error"))
            } else if (response.status === 500) {
                setErrorTitle(t("create_failed"));
                setErrorDescription(t("error_500"));
            } else if (response.status === 201) {
                queryClient.invalidateQueries({
                    queryKey: ["assets", portfolioId]
                });
                queryClient.invalidateQueries({
                    queryKey: ["valuation",portfolioId],
                    refetchType: "all"
                });
                toast.success(t("asset_created"));
                if (onCreated)
                    onCreated();
            }
        },
        onError : () => {
            setErrorTitle(t("create_failed"));
            setErrorDescription(t("error_500"));
        }
    });

    if (getPricesQuery.isLoading) {
        return (
            <div className="flex grow items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    const symbols = Object.keys(getPricesQuery.data?.data || {});

    return (
        <div {...props}>
            {
                errorTitle &&
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>{errorTitle}</AlertTitle>
                    {
                        errorDescription && <AlertDescription>
                            <p>{errorDescription}</p></AlertDescription>
                    }
                </Alert>
            }
            <form
                onSubmit={form.handleSubmit(({ symbol, quantity }) => {
                    setErrorTitle("");
                    setErrorDescription("");
                    createAssetMutation.mutate({ symbol: symbol, quantity: quantity });
                })}
                className="flex flex-col gap-4"
            >
                <Controller
                    name="symbol"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="asset-form-symbol">
                                {t("symbol")}
                            </FieldLabel>
                            <Combobox
                                items={symbols.map(s => ({ label: s, value: s }))}
                                value={field.value}
                                onValueChange={(v) => form.setValue("symbol", v)}
                                enableCreate={true}
                                textSelectItem={t("select_symbol")}
                                textSearchItemPlaceholder={t("search_symbol")}
                                textNoResults={t("no_results")}
                                {...popoverProps}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="asset-form-quantity">
                                {t("quantity")}
                            </FieldLabel>
                            <Input
                                {...field}
                                id="asset-form-quantity"
                                type="number"
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                <Button type="submit" className="w-full cursor-pointer">
                    {t("create")}
                </Button>
            </form>
        </div>
    )
}