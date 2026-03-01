import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function RiskBadge({ level }: { level: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors shadow-sm border",
                level === "High" && "bg-red-50 text-red-700 border-red-200",
                level === "Moderate" && "bg-amber-50 text-amber-700 border-amber-200",
                level === "Low" && "bg-green-50 text-green-700 border-green-200",
                !['High', 'Moderate', 'Low'].includes(level) && "bg-gray-100 text-gray-800 border-gray-200"
            )}
        >
            <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                level === "High" && "bg-red-500",
                level === "Moderate" && "bg-amber-500",
                level === "Low" && "bg-green-500",
                !['High', 'Moderate', 'Low'].includes(level) && "bg-gray-500"
            )} />
            {level === "High" ? "HIGH" : level === "Moderate" ? "MODERATE" : level === "Low" ? "LOW" : level}
        </span>
    );
}
