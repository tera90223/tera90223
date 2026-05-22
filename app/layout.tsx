import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Chantera Lazard",
  description:
    "Bioinformatician & cancer genomics researcher — federated learning, knowledge graphs, and ML pipelines. M.S. Bioinformatics at Northeastern University.",
  keywords: [
    "Chantera Lazard",
    "Bioinformatics",
    "Cancer Genomics",
    "Federated Learning",
    "Knowledge Graphs",
    "Northeastern University",
  ],
  authors: [{ name: "Chantera Lazard" }],
  openGraph: {
    title: "Chantera Lazard — Bioinformatics & Cancer Genomics",
    description:
      "Bioinformatician building ML pipelines and knowledge graphs for cancer genomics, federated learning, and variant discovery. M.S. Bioinformatics at Northeastern University.",
    url: "https://chanteralazard.com",
    siteName: "Chantera Lazard",
    type: "website",
    images: [{ url: "https://chanteralazard.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chantera Lazard — Bioinformatics & Cancer Genomics",
    description:
      "Bioinformatician building ML pipelines and knowledge graphs for cancer genomics, federated learning, and variant discovery. M.S. Bioinformatics at Northeastern University.",
    images: ["https://chanteralazard.com/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: "https://chanteralazard.com",
  mainEntity: {
    "@type": "Person",
    name: "Chantera Lazard",
    url: "https://chanteralazard.com",
    jobTitle: "Bioinformatician & Cancer Genomics Researcher",
    alumniOf: ["Northeastern University", "University of Houston"],
    sameAs: [
      "https://github.com/tera90223",
      "https://linkedin.com/in/chantera-lazard-66836652",
      "https://orcid.org/0009-0006-1367-3812",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable}`}
      style={{ fontFamily: "var(--font-sans), sans-serif" }}
    >
      <body className="min-h-screen antialiased">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
        </body>
    </html>
  );
}
