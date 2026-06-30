import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const WANDSWORTH_SCHOOLS = [
  {
    urn: "100000000001",
    name: "Belleville Primary School",
    phase: "Primary",
    type: "Academy converter",
    ofstedRating: "Outstanding",
    ofstedDate: "2023-11-15",
    latitude: 51.4728,
    longitude: -0.1635,
    postcode: "SW11 6PR",
    localAuthority: "Wandsworth",
    ageLow: 3,
    ageHigh: 11,
    pupils: 720,
    gender: "Mixed",
  },
  {
    urn: "100000000002",
    name: "Chestnut Grove Academy",
    phase: "Secondary",
    type: "Academy converter",
    ofstedRating: "Good",
    ofstedDate: "2022-06-20",
    latitude: 51.4489,
    longitude: -0.1521,
    postcode: "SW12 8JZ",
    localAuthority: "Wandsworth",
    ageLow: 11,
    ageHigh: 18,
    pupils: 980,
    gender: "Mixed",
  },
  {
    urn: "100000000003",
    name: "Thames Christian School",
    phase: "Secondary",
    type: "Independent school",
    ofstedRating: "Good",
    ofstedDate: "2024-01-10",
    latitude: 51.4612,
    longitude: -0.1789,
    postcode: "SW11 5QL",
    localAuthority: "Wandsworth",
    ageLow: 11,
    ageHigh: 16,
    pupils: 210,
    gender: "Mixed",
  },
  {
    urn: "100000000004",
    name: "Honeywell Junior School",
    phase: "Primary",
    type: "Community school",
    ofstedRating: "Outstanding",
    ofstedDate: "2021-03-08",
    latitude: 51.4645,
    longitude: -0.1712,
    postcode: "SW11 6EF",
    localAuthority: "Wandsworth",
    ageLow: 7,
    ageHigh: 11,
    pupils: 360,
    gender: "Mixed",
  },
  {
    urn: "100000000005",
    name: "Boltinghouse Manor School",
    phase: "Primary",
    type: "Academy sponsor led",
    ofstedRating: "Good",
    ofstedDate: "2023-05-22",
    latitude: 51.4789,
    longitude: -0.1598,
    postcode: "SW11 5TN",
    localAuthority: "Wandsworth",
    ageLow: 3,
    ageHigh: 11,
    pupils: 420,
    gender: "Mixed",
  },
  {
    urn: "100000000006",
    name: "Ark Bolingbroke Academy",
    phase: "Secondary",
    type: "Academy sponsor led",
    ofstedRating: "Good",
    ofstedDate: "2022-11-30",
    latitude: 51.4567,
    longitude: -0.1645,
    postcode: "SW11 5BA",
    localAuthority: "Wandsworth",
    ageLow: 11,
    ageHigh: 18,
    pupils: 850,
    gender: "Mixed",
  },
];

async function main() {
  console.log("Seeding database…");

  for (const school of WANDSWORTH_SCHOOLS) {
    await prisma.school.upsert({
      where: { urn: school.urn },
      update: school,
      create: school,
    });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@plotpulse.app" },
    update: {},
    create: {
      email: "demo@plotpulse.app",
      name: "Demo User",
      postcode: "SW11 4QR",
      tier: "free",
    },
  });

  await prisma.alertPreference.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      emailEnabled: true,
      digestFrequency: "daily",
    },
  });

  const existingPosts = await prisma.communityPost.count();
  if (existingPosts === 0) {
    await prisma.communityPost.createMany({
      data: [
        {
          authorId: demoUser.id,
          title: "Anyone know the timeline for the Lidl on Northcote Road?",
          body: "Saw the hoardings go up — wondering if it'll affect parking on our street.",
          category: "local_info",
          verifiedLocal: true,
          replies: 7,
        },
        {
          authorId: demoUser.id,
          title: "Recommended builder for loft conversions?",
          body: "Looking for someone who's done work on Maple Grove terraces before.",
          category: "trades",
          verifiedLocal: true,
          replies: 12,
        },
      ],
    });
  }

  console.log(`Seeded ${WANDSWORTH_SCHOOLS.length} schools and demo user`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
