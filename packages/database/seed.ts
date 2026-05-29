import "dotenv/config";
import crypto from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { usersTable, formsTable, responsesTable } from "./schema";
import { env } from "./env";

const db = drizzle(env.DATABASE_URL);

// Hashing function matching our upcoming auth system
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Database seeding started...");

  // 1. Create Creator User
  const demoEmail = "admin@formify.com";
  const demoPassword = "password123";
  const passHash = hashPassword(demoPassword);
  const demoApiKey = "formify_demo_api_key_2026_ninja";

  console.log("Checking if demo user already exists...");
  // Clear out old data if exists to ensure clean seed
  await db.delete(usersTable);

  const [creator] = await db
    .insert(usersTable)
    .values({
      fullName: "Piyush Garg (Demo Creator)",
      email: demoEmail,
      emailVerified: true,
      profileImageUrl: "https://avatars.githubusercontent.com/u/44622112?v=4",
      passwordHash: passHash,
      apiKey: demoApiKey,
    })
    .returning();

  if (!creator) {
    throw new Error("Failed to create creator user");
  }

  console.log(`👤 Seeded User: ${creator.fullName} (${creator.email})`);
  console.log(`🔑 Demo API Key: ${creator.apiKey}`);

  // 2. Define Seeded Forms
  const formsToSeed = [
    {
      title: "Night City Cyberpunk Survey",
      description: "A questionnaire for mercs, netrunners, and street kids traversing the neon alleyways of Night City.",
      published: true,
      visibility: "public" as const,
      theme: "cyberpunk",
      fields: [
        {
          id: "nickname",
          type: "text" as const,
          label: "What's your street handle / alias?",
          placeholder: "e.g., V, Johnny, Falco",
          required: true,
        },
        {
          id: "lifepath",
          type: "select" as const,
          label: "Select your active Lifepath",
          required: true,
          options: ["Nomad", "Street Kid", "Corpo"],
        },
        {
          id: "chrome",
          type: "checkbox" as const,
          label: "Do you have active combat cyberware installed? (Mantis Blades, Sandevistan, etc.)",
          required: false,
        },
        {
          id: "rating",
          type: "rating" as const,
          label: "Rate the safety of Watson district in Night City (1 = Death Wish, 5 = Safe Haven)",
          required: true,
        },
        {
          id: "date",
          type: "date" as const,
          label: "Date of your next heist contract",
          required: false,
        },
      ],
    },
    {
      title: "SaaS Startup Beta Tester Feedback",
      description: "Help us optimize our next-generation serverless orchestration engine. Sleep is for the weak, code is forever.",
      published: true,
      visibility: "public" as const,
      theme: "startup_dark",
      fields: [
        {
          id: "project_name",
          type: "text" as const,
          label: "Project or Company Name",
          placeholder: "e.g., Vercel, Stripe, Acme Corp",
          required: true,
        },
        {
          id: "email",
          type: "email" as const,
          label: "Founder / Engineer Email Address",
          placeholder: "you@company.com",
          required: true,
        },
        {
          id: "team_size",
          type: "number" as const,
          label: "How many core engineers are in your team?",
          required: false,
        },
        {
          id: "bottleneck",
          type: "select" as const,
          label: "What is your team's number one blocker?",
          required: true,
          options: ["Hiring", "Customer Acquisition", "Server Costs", "Technical Debt"],
        },
        {
          id: "rating",
          type: "rating" as const,
          label: "Overall rating of our developer sandbox experience",
          required: true,
        },
      ],
    },
    {
      title: "Anime Sunset Movie Night RSVP",
      description: "Gather round, fellow travellers! Join us under the cherry blossoms for our weekly animated feature film showcase.",
      published: true,
      visibility: "public" as const,
      theme: "anime_sunset",
      fields: [
        {
          id: "name",
          type: "text" as const,
          label: "What should we call you, fellow traveller?",
          placeholder: "e.g., Chihiro, Naruto, Deku",
          required: true,
        },
        {
          id: "movie",
          type: "select" as const,
          label: "Vote for tonight's feature film:",
          required: true,
          options: ["Spirited Away", "Your Name", "Akira", "Princess Mononoke"],
        },
        {
          id: "guests",
          type: "number" as const,
          label: "Number of guests you're bringing (including you)",
          required: true,
        },
        {
          id: "snack",
          type: "text" as const,
          label: "What snack/drink are you sharing?",
          placeholder: "e.g., Pocky, Ramune, Dango",
          required: false,
        },
      ],
    },
    {
      title: "Vintage Macintosh Retro Survey",
      description: "An unlisted research survey dedicated to classic 68k and PowerPC Apple computer collectors and enthusiasts.",
      published: true,
      visibility: "unlisted" as const,
      theme: "retro_mac",
      fields: [
        {
          id: "favorite_system",
          type: "select" as const,
          label: "Your favorite classic Macintosh Operating System version",
          required: true,
          options: ["System 6", "System 7", "Mac OS 8", "Mac OS 9"],
        },
        {
          id: "working_macs",
          type: "checkbox" as const,
          label: "Do you currently own a bootable CRT vintage Mac?",
          required: true,
        },
        {
          id: "hours",
          type: "number" as const,
          label: "How many hours per week do you spend retrocomputing?",
          required: false,
        },
      ],
    },
  ];

  for (const formDef of formsToSeed) {
    const [seededForm] = await db
      .insert(formsTable)
      .values({
        userId: creator.id,
        title: formDef.title,
        description: formDef.description,
        published: formDef.published,
        visibility: formDef.visibility,
        theme: formDef.theme,
        fields: formDef.fields,
      })
      .returning();
    
    if (!seededForm) {
      throw new Error(`Failed to create form: ${formDef.title}`);
    }

    console.log(`📝 Seeded Form: "${seededForm.title}" [Theme: ${seededForm.theme}, Visibility: ${seededForm.visibility}]`);

    // 3. Generate Mock Submissions
    let mockAnswers: Record<string, any>[] = [];

    if (seededForm.theme === "cyberpunk") {
      mockAnswers = [
        { nickname: "V", lifepath: "Nomad", chrome: true, rating: 2, date: "2077-10-25" },
        { nickname: "Johnny Silverhand", lifepath: "Street Kid", chrome: true, rating: 1, date: "2023-08-20" },
        { nickname: "Alt Cunningham", lifepath: "Corpo", chrome: false, rating: 4 },
        { nickname: "Panam Palmer", lifepath: "Nomad", chrome: false, rating: 3, date: "2077-12-10" },
        { nickname: "Judy Alvarez", lifepath: "Street Kid", chrome: false, rating: 2, date: "2077-09-01" },
        { nickname: "Goro Takemura", lifepath: "Corpo", chrome: true, rating: 5 },
        { nickname: "David Martinez", lifepath: "Street Kid", chrome: true, rating: 3 },
        { nickname: "Rebecca", lifepath: "Street Kid", chrome: true, rating: 1 },
        { nickname: "Lucy", lifepath: "Nomad", chrome: true, rating: 4, date: "2076-05-15" },
      ];
    } else if (seededForm.theme === "startup_dark") {
      mockAnswers = [
        { project_name: "NeonDB", email: "nikita@neon.tech", team_size: 25, bottleneck: "Hiring", rating: 5 },
        { project_name: "Formify", email: "piyush@formify.com", team_size: 4, bottleneck: "Customer Acquisition", rating: 5 },
        { project_name: "Acme Analytics", email: "john@acme.co", team_size: 12, bottleneck: "Technical Debt", rating: 4 },
        { project_name: "ByteSize", email: "sara@bytesize.io", team_size: 2, bottleneck: "Server Costs", rating: 3 },
        { project_name: "CodeShip", email: "alex@codeship.com", team_size: 45, bottleneck: "Hiring", rating: 4 },
        { project_name: "SaaSify", email: "tom@saasify.co", team_size: 8, bottleneck: "Customer Acquisition", rating: 2 },
      ];
    } else if (seededForm.theme === "anime_sunset") {
      mockAnswers = [
        { name: "Chihiro", movie: "Spirited Away", guests: 2, snack: "Roasted Newt" },
        { name: "Taki Tachibana", movie: "Your Name", guests: 1, snack: "Bento Box" },
        { name: "Kaneda", movie: "Akira", guests: 4, snack: "Pocky & Soda" },
        { name: "San", movie: "Princess Mononoke", guests: 3, snack: "Dried meat" },
        { name: "Mitsuha", movie: "Your Name", guests: 2, snack: "Sake & Rice cakes" },
        { name: "Haku", movie: "Spirited Away", guests: 1, snack: "Onigiri" },
        { name: "Tetsuo", movie: "Akira", guests: 1, snack: "Ramune" },
        { name: "Ashitaka", movie: "Princess Mononoke", guests: 2 },
      ];
    } else if (seededForm.theme === "retro_mac") {
      mockAnswers = [
        { favorite_system: "System 7", working_macs: true, hours: 5 },
        { favorite_system: "Mac OS 9", working_macs: true, hours: 10 },
        { favorite_system: "System 6", working_macs: false, hours: 2 },
        { favorite_system: "Mac OS 8", working_macs: true, hours: 1 },
        { favorite_system: "System 7", working_macs: true, hours: 15 },
      ];
    }

    // Insert mock responses
    for (const answers of mockAnswers) {
      await db.insert(responsesTable).values({
        formId: seededForm.id,
        answers: answers,
        submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time within past 7 days
        meta: {
          ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0",
        },
      });
    }

    console.log(`📊 Injected ${mockAnswers.length} mock responses for "${seededForm.title}"`);
  }

  console.log("✅ Seed database successfully complete!");
}

main().catch((err) => {
  console.error("❌ Database seeding failed:", err);
  process.exit(1);
});
