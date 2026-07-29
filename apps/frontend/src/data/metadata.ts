import type { TimelineEntry } from "$interfaces/timelineEntry";

const electricityMapsBase = {
  organization: "Electricity Maps",
  type: "work",
  showDates: true,
  group: "electricity-maps",
  link: "https://electricitymaps.com",
} as const;

const primaryWorkEntries: TimelineEntry[] = [
  {
    ...electricityMapsBase,
    title: "Open Source Community Engineer",
    employmentType: "Part-time",
    startYear: 2022,
    startMonth: 12,
    endYear: 2025,
    endMonth: 6,
    description:
      "Building and nurturing the open source community of electricitymaps-contrib as well as maintaining the open source repository of Electricity Maps. Which contains the date ingestion parsers and contained the frontend code of the public web app.",
    location: "Remote, Denmark",
  },
  {
    ...electricityMapsBase,
    title: "Software Engineer",
    employmentType: "Full-time",
    startYear: 2025,
    startMonth: 7,
    endYear: null,
    description:
      "Engineering core data ingestion, validation and processing systems for near real-time electricity data.",
    location: "Hybrid, Denmark",
  },
];

const ikeaBase = {
  organization: "IKEA",
  type: "work",
  showDates: true,
  location: "Älmhult, Sweden",
} as const;

const secondaryWorkEntries: TimelineEntry[] = [
  {
    ...ikeaBase,
    title: "FOOD Co-Worker",
    employmentType: "Seasonal",
    startYear: 2019,
    startMonth: 6,
    endYear: 2019,
    endMonth: 8,
    description: "Summer worker at the restaurant.",
  },
  {
    ...ikeaBase,
    title: "FOOD Co-Worker",
    employmentType: "Contract",
    startYear: 2022,
    startMonth: 6,
    endYear: 2023,
    endMonth: 1,
    description:
      "Summer job and recurring weekend work at the restaurant, bistro and Swedish Food Market.",
  },
];
const educationEntries: TimelineEntry[] = [
  {
    title: "Information and Media Technology",
    degree: "High School Diploma",
    organization: "Haganässkolan",
    type: "education",
    startYear: 2017,
    startMonth: 8,
    endYear: 2020,
    endMonth: 6,
    showDates: true,
    description:
      "Focus on programming in C# and web development using PHP, and JavaScript frameworks.",
    location: "Älmhult, Sweden",
  },
  {
    title: "Digital Design and Innovation",
    degree: "Bachelor of Science",
    organization: "Halmstad University",
    type: "education",
    startYear: 2022,
    startMonth: 8,
    endYear: 2025,
    endMonth: 6,
    showDates: true,
    description: "Bachelor of Science with a major in Informatics, Digital Design and Innovation",
    location: "Halmstad, Sweden",
    link: "https://hh.se",
  },
];
const lifeEntries: TimelineEntry[] = [
  {
    title: "Born",
    organization: "Sweden",
    startYear: 1999,
    startMonth: 2,
    type: "life",
    showDates: false,
  },
];

export const timelineEntries: TimelineEntry[] = [
  ...lifeEntries,
  ...educationEntries,
  ...primaryWorkEntries,
  ...secondaryWorkEntries,
];
