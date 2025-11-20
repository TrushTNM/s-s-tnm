import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "../lib/utils"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "./ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover"
import { Separator } from "./ui/separator"

interface MultiSelectFilterProps {
    title: string
    options: string[]
    selectedValues: string[]
    onSelectionChange: (values: string[]) => void
}

export function MultiSelectFilter({
    title,
    options,
    selectedValues,
    onSelectionChange,
}: MultiSelectFilterProps) {
    const [open, setOpen] = React.useState(false)
    const selectedSet = new Set(selectedValues)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-dashed">
                    <ChevronsUpDown className="mr-2 h-4 w-4" />
                    {title}
                    {selectedSet.size > 0 && (
                        <>
                            <Separator orientation="vertical" className="mx-2 h-4" />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedSet.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedSet.size > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {selectedSet.size} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selectedSet.has(option))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedSet.has(option)
                                return (
                                    <CommandItem
                                        key={option}
                                        onSelect={() => {
                                            if (isSelected) {
                                                const newSelected = new Set(selectedSet)
                                                newSelected.delete(option)
                                                onSelectionChange(Array.from(newSelected))
                                            } else {
                                                const newSelected = new Set(selectedSet)
                                                newSelected.add(option)
                                                onSelectionChange(Array.from(newSelected))
                                            }
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        <span>{option}</span>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                        {selectedSet.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => onSelectionChange([])}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
