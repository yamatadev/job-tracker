import { Seniority } from "@prisma/client";

export interface ScrapedJob {
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  description: string;
  shortDescription?: string;
  url: string;
  tags: string[];
  remote: boolean;
  seniority?: Seniority | null;
}