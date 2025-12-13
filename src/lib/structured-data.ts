import { api } from "~/trpc/server";

export async function generatePersonSchema() {
  const profile = await api.profile.get().catch(() => null);
  const skills = await api.skill.getAll().catch(() => []);

  if (!profile) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    jobTitle: profile.jobTitle,
    description: profile.headline,
    url: profile.website,
    email: profile.email,
    image: undefined,
    address: profile.location
      ? {
          "@type": "PostalAddress",
          addressLocality: profile.location,
        }
      : undefined,
    knowsAbout: skills.map((skill) => skill.name),
    sameAs: profile.website ? [profile.website] : [],
  };
}

export async function generateWebsiteSchema() {
  const profile = await api.profile.get().catch(() => null);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${profile?.fullName ?? "Portfolio"} - Portfolio`,
    url: baseUrl,
    description: profile?.headline ?? "Portfolio professionnel",
    author: {
      "@type": "Person",
      name: profile?.fullName,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export async function generatePortfolioSchema() {
  const profile = await api.profile.get().catch(() => null);
  const projects = await api.project.getAll().catch(() => []);
  const experiences = await api.experience.getAll().catch(() => []);
  const educations = await api.education.getAll().catch(() => []);

  if (!profile) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: profile.fullName,
      jobTitle: profile.jobTitle,
      description: profile.headline,
      hasOccupation: experiences.map((exp) => ({
        "@type": "Occupation",
        name: exp.role,
        occupationLocation: {
          "@type": "Place",
          address: exp.location,
        },
        estimatedSalary: undefined,
        mainEntityOfPage: {
          "@type": "Organization",
          name: exp.company,
        },
      })),
      alumniOf: educations.map((edu) => ({
        "@type": "EducationalOrganization",
        name: edu.school,
      })),
      workExample: projects.map((project) => ({
        "@type": "CreativeWork",
        name: project.name,
        description: project.summaryMd?.substring(0, 200),
        url: project.url ?? project.repoUrl,
      })),
    },
  };
}

export async function generateProjectSchema(projectId: string) {
  const api = (await import("~/trpc/server")).api;
  const project = await api.project
    .getById({ id: projectId })
    .catch(() => null);

  if (!project) return null;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.summaryMd?.substring(0, 200),
    codeRepository: project.repoUrl,
    url: project.url,
    dateCreated: project.createdAt.toISOString(),
    dateModified: project.updatedAt.toISOString(),
  };
}
