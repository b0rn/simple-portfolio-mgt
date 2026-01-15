"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export type ComboboxProps = {
    items: { label: string, value: string }[];
    value: string;
    onValueChange: (v: string) => void;
    enableCreate?: boolean;
    textSelectItem: string;
    textSearchItemPlaceholder?: string;
    textNoResults: string;
};

export function Combobox({
    items,
    value,
    onValueChange,
    enableCreate,
    textSelectItem,
    textSearchItemPlaceholder,
    textNoResults,
    ...props
}: React.ComponentProps<typeof Popover> & ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    const getValueLabel = (value: string) => {
        const item = items.find(i => i.value === value);
        if (item !== undefined)
            return item.label;
        if (enableCreate)
            return value;
    }
    const valueLabel = getValueLabel(value);

    const createCommandItem = ({ currentValue, label, value, child }: { currentValue: string, label: string, value: string, child?: React.ReactNode }) => (
        <CommandItem
            key={value}
            value={value}
            onSelect={(newValue) => {
                onValueChange(newValue === currentValue ? "" : newValue);
                setOpen(false);
            }}
        >
            {label}
            {child}
        </CommandItem>
    );

    return (
        <Popover open={open} onOpenChange={setOpen} {...props}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between"
                >
                    {
                        valueLabel === undefined ? textSelectItem : valueLabel
                    }
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                <Command>
                    <CommandInput placeholder={textSearchItemPlaceholder} className="h-9" value={searchQuery} onValueChange={setSearchQuery} />
                    <CommandList>
                        <CommandEmpty>{textNoResults}</CommandEmpty>
                        <CommandGroup>
                            {
                                items.map(i => createCommandItem({
                                    currentValue: value,
                                    label: i.label,
                                    value: i.value,
                                    child: value === i.value ? <Check className="ml-auto" /> : null
                                }))
                            }
                            {
                                enableCreate && searchQuery && items.findIndex(i => i.value === searchQuery) === -1 ?
                                    createCommandItem({
                                        currentValue: value,
                                        label: searchQuery,
                                        value: searchQuery,
                                        child: searchQuery === value ? <Check className="ml-auto" /> : null
                                    })
                                    : null
                            }
                            {
                                value && searchQuery !== value && items.findIndex(i => i.value === value) === -1 ? createCommandItem({
                                    currentValue: value,
                                    label: value,
                                    value: value,
                                    child: <Check className="ml-auto" />
                                }) : null
                            }
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
