const apiUrl = import.meta.env.VITE_API_URL || "https://dmi-api-up0g.onrender.com";

export const API_URL = apiUrl.replace(/\/$/, "");
