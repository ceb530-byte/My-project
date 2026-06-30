-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "clerkId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "verifiedLocal" BOOLEAN NOT NULL DEFAULT true,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "emailed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlertPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "planningAlerts" BOOLEAN NOT NULL DEFAULT true,
    "priceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "crimeAlerts" BOOLEAN NOT NULL DEFAULT true,
    "floodAlerts" BOOLEAN NOT NULL DEFAULT true,
    "digestFrequency" TEXT NOT NULL DEFAULT 'daily',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AlertPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "currentPeriodEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "urn" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "type" TEXT,
    "ofstedRating" TEXT,
    "ofstedDate" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "postcode" TEXT,
    "localAuthority" TEXT,
    "ageLow" INTEGER,
    "ageHigh" INTEGER,
    "pupils" INTEGER,
    "gender" TEXT
);

-- CreateTable
CREATE TABLE "CouncilTaxRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postcode" TEXT NOT NULL,
    "address" TEXT,
    "band" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'estimate',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- CreateIndex
CREATE INDEX "Alert_userId_read_idx" ON "Alert"("userId", "read");

-- CreateIndex
CREATE INDEX "Alert_userId_emailed_idx" ON "Alert"("userId", "emailed");

-- CreateIndex
CREATE UNIQUE INDEX "AlertPreference_userId_key" ON "AlertPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "EmailLog_userId_idx" ON "EmailLog"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "School_urn_key" ON "School"("urn");

-- CreateIndex
CREATE INDEX "School_latitude_longitude_idx" ON "School"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "CouncilTaxRecord_postcode_idx" ON "CouncilTaxRecord"("postcode");
