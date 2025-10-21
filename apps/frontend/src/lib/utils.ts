import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WEI_PER_ETH = 10n ** 18n;

export function formatWeiToEth(wei: string | bigint | null | undefined, fractionDigits = 4): string {
  if (wei === null || wei === undefined) {
    return "0";
  }

  let value: bigint;
  try {
    value = typeof wei === "bigint" ? wei : BigInt(wei);
  } catch {
    return "0";
  }

  const whole = value / WEI_PER_ETH;
  const remainder = value % WEI_PER_ETH;
  const remainderString = remainder.toString().padStart(18, "0").slice(0, Math.max(fractionDigits, 1));

  const trimmed = remainderString.replace(/0+$/, "");
  if (!trimmed) {
    return whole.toString();
  }
  return `${whole.toString()}.${trimmed}`;
}

export function formatDate(value?: string | null, locale = "vi-VN"): string {
  if (!value) {
    return "Khong xac dinh";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Khong xac dinh";
  }
  return date.toLocaleDateString(locale);
}
