import React, { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { cn, formatDateForEditableCell, fromDateInputValue, toDateInputValue } from "@/lib/utils";
import { ISheetColumn } from "@/types/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Helper to generate consistent pastel color from string
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 85%)`;
};

interface EditableCellProps {
    value: any;
    editable?: boolean;
    colDef: ISheetColumn;
    onSave: (value: any) => void;
}

export const EditableCell: React.FC<EditableCellProps> = React.memo(({
    value,
    colDef,
    editable = true,
    onSave,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        console.log(localValue, value);
        setIsEditing(false);
        if (localValue !== value) {
            onSave(localValue);
        }
    };

    if (!editable) {
        return (
            <div className="px-2 py-1 text-sm text-muted-foreground">
                {value || "-"}
            </div>
        );
    }

    if (colDef.type === "select") {
        return (
            <div
                className={cn(
                    "relative px-2 py-1 text-sm",
                    "min-h-[28px] flex items-center",
                    "cursor-text rounded",
                    !isEditing && "hover:bg-muted/50"
                )}
                onClick={() => !isEditing && setIsEditing(true)}
            >
                <Select
                    value={localValue}
                    onValueChange={(val) => {
                        if (val) {
                            setLocalValue(val);
                        }
                    }}
                    onOpenChange={(open) => {
                        if (!open) {
                            handleSave()
                        }
                    }}
                >
                    <SelectTrigger className="w-full h-8 px-1 py-0 text-sm border-none bg-background">
                        <SelectValue>
                            {localValue ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stringToColor(localValue) }} />
                                    <span>{localValue}</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground opacity-50">Seçin</span>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {colDef.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stringToColor(opt.value) }} />
                                    {opt.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (colDef.type === "date") {
        return (
            <div
                className={cn(
                    "relative px-2 py-1 text-sm",
                    "min-h-[28px] flex items-center",
                    "cursor-text rounded",
                    !isEditing && "hover:bg-muted/50"
                )}
                onClick={() => {
                    if (!isEditing) {
                        setLocalValue(toDateInputValue(value));
                        setIsEditing(true);
                    }
                }}
            >
                {isEditing ? (
                    <Input
                        ref={inputRef}
                        type="date"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={() => {
                            setIsEditing(false);
                            const parsed = fromDateInputValue(localValue);
                            if (parsed) onSave(parsed);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                const parsed = fromDateInputValue(localValue);
                                if (parsed) onSave(parsed);
                                setIsEditing(false);
                            }
                        }}
                        className="
                        h-6
                        px-1
                        py-0
                        text-sm
                        border-none
                        rounded
                        focus-visible:ring-1
                        focus-visible:ring-ring
                        focus-visible:ring-offset-0
                        bg-background
                    "
                    />
                ) : (
                    <span className="px-1">
                        {formatDateForEditableCell(value) || "-"}
                    </span>
                )}
            </div>
        );
    }
    return (
        <div
            className={cn(
                "relative px-2 py-1 text-sm",
                "min-h-[28px] flex items-center",
                "cursor-text rounded",
                !isEditing && "hover:bg-muted/50"
            )}
            onClick={() => !isEditing && setIsEditing(true)}
        >
            <Input
                ref={inputRef}
                value={localValue}
                readOnly={!isEditing}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="
            h-6
            px-1
            py-0
            text-sm
            border-none
            rounded
            focus-visible:ring-1
            focus-visible:ring-ring
            focus-visible:ring-offset-0
            bg-background
          "
            />
        </div>
    );
});
