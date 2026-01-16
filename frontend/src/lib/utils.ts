import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEnumKeyByValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): keyof T | undefined {
  return (Object.keys(enumObj) as Array<keyof T>)
    .find(key => enumObj[key] === value);
}

export function formatDate(inputDate: string) {
  if (!inputDate) {
    return "~";
  }

  let date: any = null;

  if (inputDate.endsWith("Z")) {
    date = new Date(`${inputDate}`);
  } else {
    date = new Date(`${inputDate}` + "Z");
  }

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hour = (date.getUTCHours() + 4).toString().padStart(2, "0");
  const minute = (date.getUTCMinutes() + 4).toString().padStart(2, "0");

  return `${day} ${month} ${year} / ${hour}:${minute}`;
}
