import { ImageResponse } from "next/og";

// Ne pas utiliser edge runtime car tRPC/Prisma nécessite Node.js
// export const runtime = "edge";

export const alt = "Portfolio";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  // Pour le moment, utiliser des valeurs par défaut
  // TODO: Récupérer depuis la base de données quand on aura un système de cache
  const fullName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Portfolio";
  const jobTitle =
    process.env.NEXT_PUBLIC_SITE_TITLE ?? "Développeur Full Stack";
  const topSkills =
    process.env.NEXT_PUBLIC_TOP_SKILLS ??
    "TypeScript · React · Next.js · Node.js";
  const location = process.env.NEXT_PUBLIC_LOCATION ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to bottom right, #1e293b, #0f172a)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {fullName}
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#94a3b8",
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          {jobTitle}
        </div>
        {topSkills && (
          <div
            style={{
              fontSize: 24,
              color: "#64748b",
              textAlign: "center",
            }}
          >
            {topSkills}
          </div>
        )}
        {location && (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              fontSize: 20,
              color: "#475569",
              display: "flex",
              alignItems: "center",
            }}
          >
            📍 {location}
          </div>
        )}
      </div>
    ),
    {
      ...size,
    },
  );
}
