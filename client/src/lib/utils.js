import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Formate une date en chaîne de caractères lisible
 * @param {string|Date} dateString - La date à formater
 * @returns {string} - La date formatée
 */
export function formatDate(dateString) {
  if (!dateString) return "Non défini";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
