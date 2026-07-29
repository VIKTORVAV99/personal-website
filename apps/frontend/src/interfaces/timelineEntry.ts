export interface TimelineEntry {
  title: string;
  organization: string;
  type: "work" | "education" | "life";
  degree?: string; // e.g. 'High School Diploma', 'Bachelor of Science'
  employmentType?: string; // e.g. 'Full-time', 'Part-time'
  startYear: number;
  startMonth?: number; // 1–12; absent = defaults to 1 (January)
  endYear?: number | null; // null = ongoing (e.g. "Present"), undefined = single point / no range
  endMonth?: number | null; // 1–12; null = ongoing; absent = defaults to 12 (December)
  showDates: boolean;
  description?: string;
  location?: string;
  group?: string; // Entries with the same group are shown on the same side with a visual connector
  link?: string; // Optional URL for more information about the entry
  linkLabel?: string; // Overrides the link text; absent = the link's host
}
