"use client"

import * as React from "react"
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { JSX } from "react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn("mx-auto flex w-full justify-center", className)}
            {...props}
        />
    )
}

function PaginationContent({
    className,
    ...props
}: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn("flex flex-row items-center gap-1", className)}
            {...props}
        />
    )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
    return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
    isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
    React.ComponentProps<typeof Link>

function PaginationLink({
    className,
    isActive,
    size = "icon",
    href,
    children,
    ...props
}: PaginationLinkProps) {
    return (
        <Link
            aria-current={isActive ? "page" : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                buttonVariants({
                    variant: isActive ? "outline" : "ghost",
                    size,
                }),
                className
            )}
            href={href}
            {...props}
        >
            {children}
        </Link>
    )
}

function PaginationPrevious({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    const t = useTranslations("Pagination")
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="default"
            className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
            {...props}
        >
            <ChevronLeftIcon />
            <span className="hidden sm:block">{t("previous")}</span>
        </PaginationLink>
    )
}

function PaginationNext({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) {
    const t = useTranslations("Pagination")
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="default"
            className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
            {...props}
        >
            <span className="hidden sm:block">{t("next")}</span>
            <ChevronRightIcon />
        </PaginationLink>
    )
}

function PaginationEllipsis({
    className,
    ...props
}: React.ComponentProps<"span">) {
    const t = useTranslations("Pagination");
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn("flex size-9 items-center justify-center", className)}
            {...props}
        >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">{t("more_pages")}</span>
        </span>
    )
}

function PaginationPageLink({
    pageNum,
    isActive = false,
    queryParams
}: {
    pageNum: number,
    isActive?: boolean,
    queryParams?: { label: string, value: string }[]
}) {
    return (
        <PaginationItem key={pageNum}>
            {!isActive ? (
                <Button variant="default" disabled className="font-bold disabled:opacity-100">{pageNum}</Button>
            ) : (
                <PaginationLink
                    isActive={isActive}
                    className="cursor-pointer"
                    href={"?" + [...(queryParams ?? []), { label: "page", value: pageNum.toString() }].map(({ label, value }) => `${label}=${encodeURIComponent(value)}`).join("&")}
                >
                    {pageNum}
                </PaginationLink>
            )}
        </PaginationItem>
    )

}

const generatePaginationLinks = (
    currentPage: number,
    totalPages: number,
    queryParams?: { label: string, value: string }[]
) => {
    const pages: JSX.Element[] = [];

    if (totalPages <= 6) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <PaginationPageLink
                    pageNum={i}
                    isActive={currentPage !== i}
                    key={i}
                    queryParams={queryParams}
                />
            );
        }
    } else {
        // always show the first page link
        pages.push(
            <PaginationPageLink
                pageNum={1}
                isActive={currentPage !== 1}
                key={1}
                queryParams={queryParams}
            />
        )

        if (currentPage < 3) {
            for (let i = 2; i <= 3; i++) {
                pages.push(
                    <PaginationPageLink
                        pageNum={i}
                        isActive={currentPage !== i}
                        key={i}
                        queryParams={queryParams}
                    />
                );
            }
        } else {
            if (currentPage > 3) {
                pages.push(<PaginationEllipsis key="ellipsis-before" />)
            }


            const minMiddleLinks = currentPage - 1 !== 1 ?
                ((currentPage + 1 === totalPages || currentPage == totalPages) && currentPage - 2 !== 1 ? currentPage - 2 : currentPage - 1)
                : currentPage
            const maxMiddleLinks = currentPage + 1 !== totalPages ? (currentPage !== totalPages ? currentPage + 1 : currentPage - 1) : currentPage

            for (let i = minMiddleLinks; i <= maxMiddleLinks; i++) {
                pages.push(
                    <PaginationPageLink
                        pageNum={i}
                        isActive={currentPage !== i}
                        key={i}
                        queryParams={queryParams}
                    />
                );
            }
        }

        if (totalPages > 6 && currentPage + 2 < totalPages) {
            pages.push(<PaginationEllipsis key="ellipsis-after" />)
        }

        // always show the last page link
        pages.push(
            <PaginationPageLink
                pageNum={totalPages}
                isActive={currentPage !== totalPages}
                key={totalPages}
                queryParams={queryParams}
            />
        )
    }
    return pages;
};

function PaginationLinks({
    currentPage,
    totalPages,
    queryParams,
    showPreviousNext
}: {
    currentPage: number;
    totalPages: number;
    queryParams?: { label: string, value: string }[]
    showPreviousNext?: boolean;
}) {
    return (
        <Pagination>
            <PaginationContent>
                {showPreviousNext && currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious
                            isActive={true}
                            className="cursor-pointer"
                            href={"?" + [...(queryParams ?? []), { label: "page", value: currentPage - 1 }].map(({ label, value }) => `${label}=${encodeURIComponent(value)}`).join("&")}
                        />
                    </PaginationItem>
                )}
                {generatePaginationLinks(currentPage, totalPages, queryParams)}
                {showPreviousNext && currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext
                            isActive={true}
                            className="cursor-pointer"
                            href={"?" + [...(queryParams ?? []), { label: "page", value: currentPage + 1 }].map(({ label, value }) => `${label}=${encodeURIComponent(value)}`).join("&")}
                        />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    )
}

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
    PaginationPageLink,
    generatePaginationLinks,
    PaginationLinks
}