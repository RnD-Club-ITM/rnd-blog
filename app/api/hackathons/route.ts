import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface DevpostPrizesCount {
  cash: number;
  other: number;
}

interface DevpostTheme {
  id: number;
  name: string;
}

interface DevpostHackathonItem {
  id: number;
  title: string;
  displayed_location: {
    icon: string;
    location: string;
  };
  open_state: string;
  thumbnail_url: string;
  url: string;
  time_left_to_submission: string;
  submission_period_dates: string;
  themes: DevpostTheme[];
  prize_amount: string;
  prizes_counts: DevpostPrizesCount;
  registrations_count: number;
  featured: boolean;
  organization_name: string;
}

interface HackClubEvent {
  id: string;
  name: string;
  website?: string;
  start: string;
  end: string;
  logo?: string;
  banner?: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  countryCode?: string | null;
  virtual: boolean;
  hybrid: boolean;
  hack_club_event?: boolean;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

// Curated list of major global hackathons to guarantee a rich database under any API blocks
const CURATED_HACKATHONS = [
  {
    id: "curated-eth-sf",
    title: "ETHGlobal San Francisco 2026",
    url: "https://ethglobal.com/events/sanfrancisco2026",
    thumbnailUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
    organizationName: "ETHGlobal",
    location: "San Francisco, CA",
    isOnline: false,
    timeLeft: "about 2 months left",
    dates: "Oct 16 - 18, 2026",
    prizeAmount: "$250,000",
    prizeVal: 250000,
    registrationsCount: 2500,
    featured: true,
    themes: ["Blockchain", "Web3", "Finance"],
    isUrgent: false,
    country: "United States",
    state: "CA",
    city: "San Francisco"
  },
  {
    id: "curated-tc-disrupt",
    title: "TechCrunch Disrupt Hackathon",
    url: "https://techcrunch.com/events/tc-disrupt-2026/",
    thumbnailUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80",
    organizationName: "TechCrunch",
    location: "San Francisco, CA",
    isOnline: false,
    timeLeft: "about 1 month left",
    dates: "Sep 18 - 20, 2026",
    prizeAmount: "$50,000",
    prizeVal: 50000,
    registrationsCount: 1200,
    featured: true,
    themes: ["Open Ended", "Enterprise", "AI/ML"],
    isUrgent: false,
    country: "United States",
    state: "CA",
    city: "San Francisco"
  },
  {
    id: "curated-treehacks",
    title: "Stanford TreeHacks 2027",
    url: "https://www.treehacks.com/",
    thumbnailUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
    organizationName: "Stanford University",
    location: "Stanford, CA",
    isOnline: false,
    timeLeft: "4 months left",
    dates: "Feb 12 - 14, 2027",
    prizeAmount: "$150,000",
    prizeVal: 150000,
    registrationsCount: 1600,
    featured: true,
    themes: ["Beginner Friendly", "Social Good", "Health"],
    isUrgent: false,
    country: "United States",
    state: "CA",
    city: "Stanford"
  },
  {
    id: "curated-web3-berlin",
    title: "Web3 Summit Hackathon Berlin",
    url: "https://web3summit.com/",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
    organizationName: "Web3 Foundation",
    location: "Berlin, Germany",
    isOnline: false,
    timeLeft: "25 days left",
    dates: "Aug 25 - 27, 2026",
    prizeAmount: "$30,000",
    prizeVal: 30000,
    registrationsCount: 650,
    featured: false,
    themes: ["Blockchain", "Web3", "Databases"],
    isUrgent: false,
    country: "Germany",
    state: "Berlin",
    city: "Berlin"
  },
  {
    id: "curated-singapore-fintech",
    title: "Singapore FinTech Global Hackcelerator",
    url: "https://www.fintechfestival.sg/",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    organizationName: "MAS Singapore",
    location: "Singapore",
    isOnline: true,
    timeLeft: "3 months left",
    dates: "Nov 09 - 13, 2026",
    prizeAmount: "$200,000",
    prizeVal: 200000,
    registrationsCount: 4500,
    featured: true,
    themes: ["Enterprise", "Databases", "Mobile"],
    isUrgent: false,
    country: "Singapore",
    state: "Singapore",
    city: "Singapore"
  },
  {
    id: "curated-devgigs-india",
    title: "DevGigs India AI Hackathon",
    url: "https://devgigs.co",
    thumbnailUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80",
    organizationName: "DevGigs",
    location: "Bangalore, India",
    isOnline: false,
    timeLeft: "12 days left",
    dates: "Jul 28 - 30, 2026",
    prizeAmount: "₹500,000",
    prizeVal: 6000,
    registrationsCount: 3200,
    featured: false,
    themes: ["AI/ML", "Web", "Mobile"],
    isUrgent: false,
    country: "India",
    state: "Karnataka",
    city: "Bangalore"
  },
  {
    id: "curated-mhacks",
    title: "MHacks 2026",
    url: "https://mhacks.org/",
    thumbnailUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80",
    organizationName: "University of Michigan",
    location: "Ann Arbor, MI",
    isOnline: false,
    timeLeft: "about 2 months left",
    dates: "Sep 11 - 13, 2026",
    prizeAmount: "$35,000",
    prizeVal: 35000,
    registrationsCount: 1100,
    featured: false,
    themes: ["Beginner Friendly", "Open Ended", "Arts"],
    isUrgent: false,
    country: "United States",
    state: "MI",
    city: "Ann Arbor"
  },
  {
    id: "curated-google-cloud",
    title: "Google Cloud AI Builders Hackathon",
    url: "https://cloud.google.com/events",
    thumbnailUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=80",
    organizationName: "Google Cloud",
    location: "London, UK",
    isOnline: false,
    timeLeft: "3 days left",
    dates: "Jul 01 - 03, 2026",
    prizeAmount: "$100,000",
    prizeVal: 100000,
    registrationsCount: 2100,
    featured: true,
    themes: ["AI/ML", "Databases", "Web"],
    isUrgent: true,
    country: "United Kingdom",
    state: "England",
    city: "London"
  },
  {
    id: "curated-imagine-cup",
    title: "Microsoft Imagine Cup Global Finals",
    url: "https://imaginecup.microsoft.com/",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    organizationName: "Microsoft",
    location: "Seattle, WA",
    isOnline: true,
    timeLeft: "10 months left",
    dates: "May 15 - 18, 2027",
    prizeAmount: "$100,000",
    prizeVal: 100000,
    registrationsCount: 15000,
    featured: true,
    themes: ["Social Good", "Open Ended", "AI/ML"],
    isUrgent: false,
    country: "United States",
    state: "WA",
    city: "Seattle"
  },
  {
    id: "curated-aws-gameday",
    title: "AWS GameDay Hackathon",
    url: "https://aws.amazon.com/gameday/",
    thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
    organizationName: "Amazon Web Services",
    location: "Las Vegas, NV",
    isOnline: false,
    timeLeft: "5 months left",
    dates: "Dec 01 - 03, 2026",
    prizeAmount: "$80,000",
    prizeVal: 80000,
    registrationsCount: 4500,
    featured: false,
    themes: ["Enterprise", "Databases", "Gaming"],
    isUrgent: false,
    country: "United States",
    state: "NV",
    city: "Las Vegas"
  },
  {
    id: "curated-hack-london",
    title: "Hack London 2026",
    url: "https://hacklondon.org/",
    thumbnailUrl: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600&auto=format&fit=crop&q=80",
    organizationName: "KCL & UCL",
    location: "London, UK",
    isOnline: false,
    timeLeft: "4 days left",
    dates: "Jul 02 - 03, 2026",
    prizeAmount: "£10,000",
    prizeVal: 13000,
    registrationsCount: 800,
    featured: false,
    themes: ["Beginner Friendly", "Web", "Mobile"],
    isUrgent: true,
    country: "United Kingdom",
    state: "England",
    city: "London"
  },
  {
    id: "curated-tokyo-web3",
    title: "Tokyo Web3 Global Hackathon",
    url: "https://web3hack.tokyo/",
    thumbnailUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80",
    organizationName: "Web3 Tokyo Community",
    location: "Tokyo, Japan",
    isOnline: false,
    timeLeft: "1 month left",
    dates: "Aug 02 - 04, 2026",
    prizeAmount: "¥5,000,000",
    prizeVal: 35000,
    registrationsCount: 1400,
    featured: true,
    themes: ["Blockchain", "Web3", "Gaming"],
    isUrgent: false,
    country: "Japan",
    state: "Tokyo",
    city: "Tokyo"
  },
  {
    id: "curated-hack-the-north",
    title: "Hack the North 2026",
    url: "https://hackthenorth.com/",
    thumbnailUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80",
    organizationName: "University of Waterloo",
    location: "Waterloo, ON, Canada",
    isOnline: false,
    timeLeft: "about 2 months left",
    dates: "Sep 18 - 20, 2026",
    prizeAmount: "$45,000",
    prizeVal: 45000,
    registrationsCount: 3000,
    featured: true,
    themes: ["Beginner Friendly", "Open Ended", "Hardware"],
    isUrgent: false,
    country: "Canada",
    state: "Ontario",
    city: "Waterloo"
  },
  {
    id: "curated-solana-ren",
    title: "Solana Renaissance Hackathon",
    url: "https://solana.com/renaissance",
    thumbnailUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80",
    organizationName: "Solana Foundation",
    location: "Online",
    isOnline: true,
    timeLeft: "about 1 month left",
    dates: "Jul 28 - Aug 30, 2026",
    prizeAmount: "$1,000,000",
    prizeVal: 1000000,
    registrationsCount: 22000,
    featured: true,
    themes: ["Blockchain", "Web3", "Finance"],
    isUrgent: false,
    country: "Online",
    state: "Online",
    city: "Online"
  },
  {
    id: "curated-eth-porto",
    title: "ETHPorto 2026",
    url: "https://ethporto.co/",
    thumbnailUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
    organizationName: "Porto Web3 Group",
    location: "Porto, Portugal",
    isOnline: false,
    timeLeft: "about 2 months left",
    dates: "Sep 04 - 06, 2026",
    prizeAmount: "$25,000",
    prizeVal: 25000,
    registrationsCount: 500,
    featured: false,
    themes: ["Blockchain", "Web3", "Open Ended"],
    isUrgent: false,
    country: "Portugal",
    state: "Porto",
    city: "Porto"
  },
  {
    id: "curated-hack-paris",
    title: "HackParis 2026",
    url: "https://hackparis.com/",
    thumbnailUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80",
    organizationName: "Paris Developers Assoc",
    location: "Paris, France",
    isOnline: true,
    timeLeft: "2 months left",
    dates: "Sep 15 - 17, 2026",
    prizeAmount: "€15,000",
    prizeVal: 16500,
    registrationsCount: 950,
    featured: false,
    themes: ["Web", "AI/ML", "Arts"],
    isUrgent: false,
    country: "France",
    state: "Paris",
    city: "Paris"
  },
  {
    id: "curated-hack-sydney",
    title: "HackSydney 2026",
    url: "https://hacksydney.org/",
    thumbnailUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80",
    organizationName: "Sydney Tech Union",
    location: "Sydney, NSW, Australia",
    isOnline: false,
    timeLeft: "1 month left",
    dates: "Aug 14 - 16, 2026",
    prizeAmount: "$20,000 AUD",
    prizeVal: 14000,
    registrationsCount: 750,
    featured: false,
    themes: ["Mobile", "AI/ML", "Web"],
    isUrgent: false,
    country: "Australia",
    state: "New South Wales",
    city: "Sydney"
  },
  {
    id: "curated-pennapps",
    title: "PennApps XXVII",
    url: "https://pennapps.com/",
    thumbnailUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    organizationName: "University of Pennsylvania",
    location: "Philadelphia, PA",
    isOnline: false,
    timeLeft: "about 2 months left",
    dates: "Sep 04 - 06, 2026",
    prizeAmount: "$60,000",
    prizeVal: 60000,
    registrationsCount: 1200,
    featured: true,
    themes: ["Beginner Friendly", "Open Ended", "Mobile"],
    isUrgent: false,
    country: "United States",
    state: "PA",
    city: "Philadelphia"
  },
  {
    id: "curated-calhacks",
    title: "CalHacks 13.0",
    url: "https://calhacks.io/",
    thumbnailUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    organizationName: "UC Berkeley",
    location: "Berkeley, CA",
    isOnline: false,
    timeLeft: "3 months left",
    dates: "Oct 09 - 11, 2026",
    prizeAmount: "$120,000",
    prizeVal: 120000,
    registrationsCount: 2000,
    featured: true,
    themes: ["AI/ML", "Web", "Social Good"],
    isUrgent: false,
    country: "United States",
    state: "CA",
    city: "Berkeley"
  },
  {
    id: "curated-hackmit",
    title: "HackMIT 2026",
    url: "https://hackmit.org/",
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=80",
    organizationName: "MIT",
    location: "Cambridge, MA",
    isOnline: false,
    timeLeft: "about 2 months left",
    dates: "Sep 19 - 20, 2026",
    prizeAmount: "$30,000",
    prizeVal: 30000,
    registrationsCount: 1000,
    featured: true,
    themes: ["Beginner Friendly", "Open Ended", "Hardware"],
    isUrgent: false,
    country: "United States",
    state: "MA",
    city: "Cambridge"
  },
  {
    id: "curated-eth-denver",
    title: "ETHDenver 2027",
    url: "https://www.ethdenver.com/",
    thumbnailUrl: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600&auto=format&fit=crop&q=80",
    organizationName: "SporkDAO",
    location: "Denver, CO",
    isOnline: false,
    timeLeft: "8 months left",
    dates: "Feb 25 - Mar 07, 2027",
    prizeAmount: "$500,000",
    prizeVal: 500000,
    registrationsCount: 15000,
    featured: true,
    themes: ["Blockchain", "Web3", "Databases"],
    isUrgent: false,
    country: "United States",
    state: "CO",
    city: "Denver"
  },
  {
    id: "curated-hackutd",
    title: "HackUTD: Ripple Effect",
    url: "https://hackutd.to/",
    thumbnailUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
    organizationName: "UT Dallas",
    location: "Dallas, TX",
    isOnline: false,
    timeLeft: "5 months left",
    dates: "Nov 07 - 08, 2026",
    prizeAmount: "$20,000",
    prizeVal: 20000,
    registrationsCount: 1000,
    featured: false,
    themes: ["Beginner Friendly", "Mobile", "Enterprise"],
    isUrgent: false,
    country: "United States",
    state: "TX",
    city: "Dallas"
  },
  {
    id: "curated-hack-illinois",
    title: "HackIllinois 2027",
    url: "https://hackillinois.org/",
    thumbnailUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=80",
    organizationName: "UIUC",
    location: "Urbana, IL",
    isOnline: false,
    timeLeft: "8 months left",
    dates: "Feb 19 - 21, 2027",
    prizeAmount: "$25,000",
    prizeVal: 25000,
    registrationsCount: 1200,
    featured: false,
    themes: ["Open Source", "Web", "Beginner Friendly"],
    isUrgent: false,
    country: "United States",
    state: "IL",
    city: "Urbana"
  },
  {
    id: "curated-mchacks",
    title: "McHacks 13",
    url: "https://mchacks.ca/",
    thumbnailUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80",
    organizationName: "McGill University",
    location: "Montreal, QC, Canada",
    isOnline: false,
    timeLeft: "7 months left",
    dates: "Jan 24 - 25, 2027",
    prizeAmount: "$30,000",
    prizeVal: 30000,
    registrationsCount: 800,
    featured: false,
    themes: ["Beginner Friendly", "Open Ended", "Web"],
    isUrgent: false,
    country: "Canada",
    state: "Quebec",
    city: "Montreal"
  }
];

// Helper to sanitize location parts, map to correct country, and extract postal codes from states
function cleanLocationParts(city: string, state: string, country: string) {
  let cleanCountry = country.trim();
  let cleanState = state.trim();
  const cleanCity = city.trim();

  // 1. Detect Country from Pincodes / State names
  const indianStateRegex = /(tamilnadu|tamil nadu|karnataka|maharashtra|delhi|gujarat|telangana|andhra|punjab|haryana|west bengal|rajasthan|kerala|goa|bihar|odisha)/i;
  const indianPincodeRegex = /\b\d{6}\b/; // 6 digits is Indian pincode
  
  const canadianProvinceRegex = /(ontario|quebec|british columbia|alberta|manitoba|saskatchewan|nova scotia|new brunswick)/i;
  const canadianPostalRegex = /[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d/;

  if (
    indianPincodeRegex.test(cleanCountry) ||
    indianStateRegex.test(cleanCountry) ||
    indianStateRegex.test(cleanState)
  ) {
    cleanCountry = "India";
    if (indianStateRegex.test(cleanState)) {
      cleanState = cleanState.replace(/-\s*\d+/, "").trim(); // remove pincode from state
    } else if (indianStateRegex.test(country)) {
      cleanState = country.replace(/-\s*\d+/, "").trim();
    }
  } else if (
    canadianPostalRegex.test(cleanCountry) ||
    canadianProvinceRegex.test(cleanCountry) ||
    canadianProvinceRegex.test(cleanState)
  ) {
    cleanCountry = "Canada";
  }

  // 2. Standard Country Mapping
  const countryMap: Record<string, string> = {
    "usa": "United States",
    "united states of america": "United States",
    "us": "United States",
    "united kingdom": "United Kingdom",
    "uk": "United Kingdom",
    "great britain": "United Kingdom",
    "england": "United Kingdom",
    "in": "India",
    "ind": "India",
    "ca": "Canada",
    "can": "Canada",
    "de": "Germany",
    "germany": "Germany",
    "eg": "Egypt",
    "egypt": "Egypt",
    "sg": "Singapore",
    "singapore": "Singapore",
    "id": "Indonesia",
    "indonesia": "Indonesia",
    "fr": "France",
    "france": "France",
    "jp": "Japan",
    "japan": "Japan",
    "au": "Australia",
    "australia": "Australia",
  };

  const mappedCountry = countryMap[cleanCountry.toLowerCase()];
  if (mappedCountry) {
    cleanCountry = mappedCountry;
  }

  // If country is still empty or looks like a US state
  if (US_STATES.includes(cleanCountry.toUpperCase())) {
    cleanState = cleanCountry.toUpperCase();
    cleanCountry = "United States";
  }

  // Clean country names casing nicely
  cleanCountry = cleanCountry
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // Clean up "Other" state
  if (!cleanState || cleanState.toLowerCase() === "other") {
    cleanState = cleanCountry;
  }

  return {
    country: cleanCountry,
    state: cleanState,
    city: cleanCity,
  };
}

// Parser helper to separate location strings into country, state, city
function parseLocation(
  locStr: string,
  displayedCountry?: string | null,
  displayedState?: string | null,
  displayedCity?: string | null
) {
  const cleanStr = locStr ? locStr.trim() : "";

  if (
    !cleanStr ||
    cleanStr.toLowerCase() === "online" ||
    cleanStr.toLowerCase() === "virtual"
  ) {
    return {
      country: "Online",
      state: "Online",
      city: "Online",
    };
  }

  let country = displayedCountry ? displayedCountry.trim() : "";
  let state = displayedState ? displayedState.trim() : "";
  let city = displayedCity ? displayedCity.trim() : "";

  if (country && city) {
    return cleanLocationParts(city, state, country);
  }

  // Parse location string
  const parts = cleanStr.split(",").map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 3) {
    country = parts[parts.length - 1];
    state = parts[parts.length - 2];
    city = parts.slice(0, parts.length - 2).join(", ");
  } else if (parts.length === 2) {
    const secondPart = parts[1];
    if (
      US_STATES.includes(secondPart.toUpperCase()) ||
      (secondPart.length === 2 && /^[a-zA-Z]{2}$/.test(secondPart))
    ) {
      country = "United States";
      state = secondPart;
      city = parts[0];
    } else {
      country = secondPart;
      state = secondPart;
      city = parts[0];
    }
  } else if (parts.length === 1) {
    city = parts[0];
    country = parts[0];
    state = parts[0];
  } else {
    city = "Venue TBA";
    country = "Other";
    state = "Other";
  }

  return cleanLocationParts(city, state, country);
}

export async function GET() {
  try {
    // 1. Fetch first 5 pages from Devpost in parallel
    const devpostPromises = Array.from({ length: 5 }, (_, i) => {
      const page = i + 1;
      return fetch(`https://devpost.com/api/hackathons?page=${page}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        next: { revalidate: 300 },
      })
        .then((res) => (res.ok ? res.json() : { hackathons: [] }))
        .catch(() => ({ hackathons: [] }));
    });

    // 2. Fetch upcoming events from Hack Club API in parallel
    const hackClubPromise = fetch(
      "https://hackathons.hackclub.com/api/events/upcoming",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        next: { revalidate: 300 },
      }
    )
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []);

    const [devpostResults, hackClubEvents] = await Promise.all([
      Promise.all(devpostPromises),
      hackClubPromise,
    ]);

    const devpostHackathons: DevpostHackathonItem[] = devpostResults.flatMap(
      (res) => res.hackathons || []
    );

    // 3. Process Devpost hackathons
    const normalizedDevpost = devpostHackathons.map((item) => {
      const cleanPrizeText = (item.prize_amount || "")
        .replace(/<[^>]*>/g, "")
        .trim();

      const numericPrizeVal =
        parseFloat(cleanPrizeText.replace(/[^0-9.]/g, "")) || 0;

      const timeLeft = item.time_left_to_submission || "Ended";
      const isOnline = item.displayed_location?.location?.toLowerCase() === "online";

      const locDetails = parseLocation(item.displayed_location?.location || "");

      let isUrgent = false;
      const daysMatch = timeLeft.match(/^(\d+)\s+days?\s+left$/i);
      if (daysMatch) {
        const days = parseInt(daysMatch[1], 10);
        isUrgent = days <= 5;
      } else if (
        timeLeft.toLowerCase().includes("hour") ||
        timeLeft.toLowerCase().includes("minute") ||
        timeLeft.toLowerCase().includes("day left")
      ) {
        isUrgent = true;
      }

      return {
        id: `devpost-${item.id}`,
        title: item.title || "Unnamed Hackathon",
        url: item.url || "#",
        thumbnailUrl: item.thumbnail_url
          ? item.thumbnail_url.startsWith("//")
            ? `https:${item.thumbnail_url}`
            : item.thumbnail_url
          : "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&auto=format&fit=crop&q=80",
        organizationName: item.organization_name || "Community Organizer",
        location: item.displayed_location?.location || "TBA",
        isOnline,
        timeLeft,
        dates: item.submission_period_dates || "TBD",
        prizeAmount: cleanPrizeText || "$0",
        prizeVal: numericPrizeVal,
        registrationsCount: item.registrations_count || 0,
        featured: Boolean(item.featured),
        themes: (item.themes || []).map((t) => t.name),
        isUrgent,
        country: locDetails.country,
        state: locDetails.state,
        city: locDetails.city,
      };
    });

    // 4. Process Hack Club hackathons
    const normalizedHackClub = (hackClubEvents as HackClubEvent[]).map((item, index) => {
      const isOnline = Boolean(item.virtual);
      const startD = new Date(item.start);
      const endD = new Date(item.end);

      const diffMs = startD.getTime() - Date.now();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      let timeLeft = "Ongoing / Started";
      if (diffDays > 1) {
        timeLeft = `${diffDays} days left`;
      } else if (diffDays === 1) {
        timeLeft = "1 day left";
      } else if (diffDays === 0) {
        timeLeft = "Starts today";
      }

      const startStr = startD.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const endStr = endD.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const dates = `${startStr} - ${endStr}`;

      const locDetails = parseLocation(
        isOnline ? "Online" : `${item.city || ""}, ${item.state || ""}, ${item.country || ""}`,
        item.country || (item.countryCode === "US" ? "United States" : item.countryCode),
        item.state,
        item.city
      );

      return {
        id: `hackclub-${item.id || index}`,
        title: item.name || "Hack Club Hackathon",
        url: item.website || "#",
        thumbnailUrl:
          item.banner ||
          item.logo ||
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80",
        organizationName: item.hack_club_event ? "Hack Club" : "Community Partner",
        location: isOnline ? "Online" : `${item.city || "Venue TBA"}, ${item.state || ""}`,
        isOnline,
        timeLeft,
        dates,
        prizeAmount: "Free Entry",
        prizeVal: 0,
        registrationsCount: 0,
        featured: Boolean(item.hack_club_event),
        themes: ["Beginner Friendly", "Open Ended"],
        isUrgent: diffDays >= 0 && diffDays <= 5,
        country: locDetails.country,
        state: locDetails.state,
        city: locDetails.city,
      };
    });

    // 5. Combine curated fallback, Devpost, and Hack Club
    const combined = [...CURATED_HACKATHONS, ...normalizedDevpost, ...normalizedHackClub];
    
    // Deduplicate by ID
    const uniqueMap = new Map<string, typeof combined[0]>();
    combined.forEach((h) => {
      uniqueMap.set(h.id, h);
    });

    return NextResponse.json({
      hackathons: Array.from(uniqueMap.values()),
    });
  } catch (error) {
    console.error("Error fetching hackathons from multiple APIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch hackathons from sources" },
      { status: 500 }
    );
  }
}
