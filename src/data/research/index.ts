import profileData from "./profile.json";
import publicationData from "./publications.json";
import newsData from "./news.json";

export interface ResearchLink {
  label: string;
  url: string;
}

export interface Experience {
  institution: string;
  role: string;
  period: string;
  logo: string;
}

export interface ResearchProfile {
  name: string;
  chineseName: string;
  role: string;
  affiliation: string;
  email: string;
  portrait: string;
  links: ResearchLink[];
  education: Experience[];
  employment: Experience[];
}

export interface Publication {
  id: string;
  title: string;
  date: string;
  acceptedDate?: string;
  year: number;
  selected: boolean;
  venue: string;
  distinction: string;
  authors: string[];
  description?: string;
  cover: string;
  github?: {
    repository: string;
    stars: number;
    checkedAt: string;
  };
  links: ResearchLink[];
}

export interface ResearchNews {
  date: string;
  body: { text: string; url?: string }[];
}

export const profile: ResearchProfile = profileData;
export const publications: readonly Publication[] = publicationData;
export const news: readonly ResearchNews[] = newsData;
export const selectedPublications = publications
  .filter((paper) => paper.selected)
  .sort((a, b) => (b.acceptedDate ?? "").localeCompare(a.acceptedDate ?? ""));
export const publicationYears = [
  ...new Set(publications.map((paper) => paper.year)),
].sort((a, b) => b - a);
