import { BACKEND } from "../api";

export function assetUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${BACKEND}${url}`;
}

export function productEmoji(product = {}) {
  const text =
    `${product.name || ""} ${product.category || ""}`.toLowerCase();

  if (
    text.includes("rice") ||
    text.includes("atta") ||
    text.includes("dal") ||
    text.includes("grain")
  ) {
    return "🍚";
  }

  if (
    text.includes("cake") ||
    text.includes("bakery") ||
    text.includes("bread")
  ) {
    return "🎂";
  }

  if (
    text.includes("oil") ||
    text.includes("ghee")
  ) {
    return "🫗";
  }

  if (
    text.includes("milk") ||
    text.includes("dairy") ||
    text.includes("curd")
  ) {
    return "🥛";
  }

  if (
    text.includes("biscuit") ||
    text.includes("cookie") ||
    text.includes("snack")
  ) {
    return "🍪";
  }

  if (
    text.includes("fruit") ||
    text.includes("apple") ||
    text.includes("banana")
  ) {
    return "🍎";
  }

  if (
    text.includes("vegetable") ||
    text.includes("tomato") ||
    text.includes("potato")
  ) {
    return "🥕";
  }

  if (text.includes("drink") || text.includes("juice")) {
    return "🥤";
  }

  return "📦";
}
