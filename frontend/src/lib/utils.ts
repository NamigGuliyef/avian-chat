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

  let date: Date = null;

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

  date.setHours(date.getUTCHours() + 4)

  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} / ${hour}:${minute}`;
}


export const formatDateForEditableCell = (value: any) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "";

  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();

  return `${dd}/${mm}/${yyyy}`;
};

export const parseDate = (value: string) => {
  const [dd, mm, yyyy] = value.split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;

  const date = new Date(yyyy, mm - 1, dd);
  return isNaN(date.getTime()) ? null : date;
};

export const toDateInputValue = (value: any) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const fromDateInputValue = (value: string) => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
