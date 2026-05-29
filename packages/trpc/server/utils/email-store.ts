export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: Date;
  type: "creator_notification" | "respondent_confirmation";
}

// Global variable that persists in the active server memory space
const emailStore: SimulatedEmail[] = [];

// Seed default emails so the inbox starts with some interactive entries
emailStore.push(
  {
    id: "mail_1",
    to: "admin@formify.com",
    subject: "Welcome to Formify! 🚀",
    body: "Hi Piyush!\n\nWelcome to Formify. Your creator sandbox accounts have been successfully seeded with 4 ready-to-test creative forms (Cyberpunk theme, Retro Mac, Anime Sunset, and Startup Dark) along with comprehensive analytics.\n\nEnjoy building dynamic forms!\n\nBest,\nThe Formify Team",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "creator_notification",
  },
  {
    id: "mail_2",
    to: "admin@formify.com",
    subject: "New Submission Alert: Night City Cyberpunk Survey ⚡",
    body: "Hey merc!\n\nA new netrunner has completed your Night City Cyberpunk Survey!\n\nAlias: Johnny Silverhand\nLifepath: Street Kid\nCombat Chrome: True\nSafety Rating: 1 Star\n\nGo check your Creator Dashboard Analytics for full charts!",
    sentAt: new Date(Date.now() - 30 * 60 * 1000),
    type: "creator_notification",
  }
);

export function getEmails(): SimulatedEmail[] {
  return emailStore;
}

export function addEmail(email: Omit<SimulatedEmail, "id" | "sentAt">): SimulatedEmail {
  const newEmail: SimulatedEmail = {
    ...email,
    id: "mail_" + Math.random().toString(36).substring(2, 9),
    sentAt: new Date(),
  };
  emailStore.unshift(newEmail); // Add to the front of the list
  return newEmail;
}
