import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mediareachdigital.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/services", "/login", "/register", "/api-docs"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

