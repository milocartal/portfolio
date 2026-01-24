import { type MetadataRoute } from "next";
import { api } from "~/trpc/server";
import { db } from "~/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Récupérer les projets et CVs pour les inclure dans le sitemap
  const [projects, cvs] = await Promise.all([
    api.project.getAll().catch(() => []),
    db.cvVersion.findMany().catch(() => []),
  ]);

  const projectUrls: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const cvUrls: MetadataRoute.Sitemap = cvs.map((cv) => ({
    url: `${baseUrl}/cv/${cv.slug}`,
    lastModified: cv.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cv`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    ...projectUrls,
    ...cvUrls,
  ];
}
