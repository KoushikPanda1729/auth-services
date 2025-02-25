export const isJwtValid = (token: string | null): boolean => {
  if (!token || token.split(".").length !== 3) return false;

  try {
    const [header] = token.split(".");
    return Buffer.from(header, "base64").toString("utf-8") !== "";
  } catch {
    return false;
  }
};
