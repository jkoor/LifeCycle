"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Github } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dock, DockIcon } from "@/components/ui/dock";
import { navConfig } from "./nav-config";

export function DockNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
            <Dock direction="middle">
                <DockIcon>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="/"
                                className={cn(
                                    buttonVariants({ variant: "ghost", size: "icon" }),
                                    "size-12 rounded-full",
                                    pathname === "/" && "bg-muted"
                                )}
                            >
                                <Home className="size-4" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Home</p>
                        </TooltipContent>
                    </Tooltip>
                </DockIcon>

                <Separator orientation="vertical" className="h-full py-2" />

                {navConfig.mainNav.map((item) => (
                    <DockIcon key={item.href}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        buttonVariants({ variant: "ghost", size: "icon" }),
                                        "size-12 rounded-full",
                                        pathname === item.href && "bg-muted"
                                    )}
                                >
                                    <item.icon className="size-4" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{item.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </DockIcon>
                ))}

                <Separator orientation="vertical" className="h-full py-2" />

                <DockIcon>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                    buttonVariants({ variant: "ghost", size: "icon" }),
                                    "size-12 rounded-full"
                                )}
                            >
                                <Github className="size-4" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>GitHub</p>
                        </TooltipContent>
                    </Tooltip>
                </DockIcon>
            </Dock>
        </div>
    );
}
