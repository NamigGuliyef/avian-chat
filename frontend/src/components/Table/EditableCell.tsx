import React, { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

interface EditableCellProps {
    value: any;
    editable?: boolean;
    onSave: (value: any) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
    value,
    editable = true,
    onSave,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value ?? "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
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
};
