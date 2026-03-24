export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const uniqueSlug = (base: string): string => {
  const timestamp = Date.now().toString(36);
  return `${generateSlug(base)}-${timestamp}`;
};
