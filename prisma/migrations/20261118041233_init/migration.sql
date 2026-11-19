-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Nuestro equipo',
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "timezone" TEXT NOT NULL DEFAULT 'America/Hermosillo',
    "locale" TEXT NOT NULL DEFAULT 'es-MX',
    "inviteCode" TEXT NOT NULL,
    "inviteCodeExpiresAt" DATETIME,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarKey" TEXT NOT NULL DEFAULT 'CUSTOM',
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Split" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'TEAM_DEFAULT',
    "goalId" TEXT,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Split_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Split_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SplitShare" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "splitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,
    CONSTRAINT "SplitShare_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SplitShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IncomeSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isVariable" BOOLEAN NOT NULL DEFAULT false,
    "amountCents" INTEGER,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "expectedDay" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IncomeSource_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IncomeSource_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IncomePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incomeSourceId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "receivedAmountCents" INTEGER NOT NULL DEFAULT 0,
    "expectedDate" DATETIME,
    "receivedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IncomePayment_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "IncomeSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
    "initialAmountCents" INTEGER NOT NULL DEFAULT 0,
    "interestRateBp" INTEGER,
    "dueDayOfMonth" INTEGER,
    "monthlyPaymentCents" INTEGER,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "status" TEXT NOT NULL DEFAULT 'UNCONFIGURED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "configuredAt" DATETIME,
    "defeatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Debt_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Debt_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DebtPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "debtId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "principalCents" INTEGER NOT NULL,
    "interestCents" INTEGER NOT NULL DEFAULT 0,
    "isExtraordinary" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DebtPayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DebtPayment_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "photoUrl" TEXT,
    "targetAmountCents" INTEGER NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'BY_DATE',
    "targetDate" DATETIME,
    "monthlyBudgetCents" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoalContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "contributedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoalContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GoalContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PersonalSalaryConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "desiredAmountCents" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PersonalSalaryConfig_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PersonalSalaryConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaryRelease" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "monthLabel" TEXT NOT NULL,
    "releasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "SalaryRelease_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalaryRelease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commitment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "dueDayOfMonth" INTEGER NOT NULL,
    "recurrence" TEXT NOT NULL DEFAULT 'MONTHLY',
    "category" TEXT,
    "linkedDebtId" TEXT,
    "autoGenerate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Commitment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommitmentInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commitmentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "paidAmountCents" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "monthLabel" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommitmentInstance_commitmentId_fkey" FOREIGN KEY ("commitmentId") REFERENCES "Commitment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommitmentInstance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "monthlyLimitCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetCategory_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "category" TEXT,
    "note" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedDebtId" TEXT,
    "relatedGoalId" TEXT,
    "relatedIncomePaymentId" TEXT,
    "relatedBudgetCategoryId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movement_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "targetCount" INTEGER NOT NULL DEFAULT 1,
    "progressCount" INTEGER NOT NULL DEFAULT 0,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Challenge_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "XpAward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XpAward_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "XpAward_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "badgeKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Badge_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardChestConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "percentOfSurplus" INTEGER NOT NULL DEFAULT 20,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardChestConfig_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardChestOutcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "monthLabel" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "amountCents" INTEGER,
    "choice" TEXT,
    "decidedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardChestOutcome_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "relatedDebtId" TEXT,
    "relatedGoalId" TEXT,
    "relatedIncomeSourceId" TEXT,
    "dueAt" DATETIME NOT NULL,
    "leadTime" TEXT NOT NULL DEFAULT 'ONE_DAY',
    "customLeadMinutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "icsUid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reminder_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalendarSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    CONSTRAINT "CalendarSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthClosing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "monthLabel" TEXT NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "challengesCompleted" INTEGER NOT NULL DEFAULT 0,
    "badgesEarned" INTEGER NOT NULL DEFAULT 0,
    "amountSavedCents" INTEGER NOT NULL DEFAULT 0,
    "debtReductionCents" INTEGER NOT NULL DEFAULT 0,
    "goalsCompletedCount" INTEGER NOT NULL DEFAULT 0,
    "rewardUnlockedCents" INTEGER,
    "surplusDecision" TEXT,
    "closedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MonthClosing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_inviteCode_key" ON "Team"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Split_teamId_scope_idx" ON "Split"("teamId", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "SplitShare_splitId_userId_key" ON "SplitShare"("splitId", "userId");

-- CreateIndex
CREATE INDEX "IncomeSource_teamId_type_idx" ON "IncomeSource"("teamId", "type");

-- CreateIndex
CREATE INDEX "IncomePayment_incomeSourceId_status_idx" ON "IncomePayment"("incomeSourceId", "status");

-- CreateIndex
CREATE INDEX "Debt_teamId_status_idx" ON "Debt"("teamId", "status");

-- CreateIndex
CREATE INDEX "DebtPayment_debtId_idx" ON "DebtPayment"("debtId");

-- CreateIndex
CREATE INDEX "Goal_teamId_isCompleted_idx" ON "Goal"("teamId", "isCompleted");

-- CreateIndex
CREATE INDEX "GoalContribution_goalId_idx" ON "GoalContribution"("goalId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalSalaryConfig_userId_key" ON "PersonalSalaryConfig"("userId");

-- CreateIndex
CREATE INDEX "SalaryRelease_teamId_userId_monthLabel_idx" ON "SalaryRelease"("teamId", "userId", "monthLabel");

-- CreateIndex
CREATE INDEX "CommitmentInstance_teamId_monthLabel_idx" ON "CommitmentInstance"("teamId", "monthLabel");

-- CreateIndex
CREATE INDEX "BudgetCategory_teamId_idx" ON "BudgetCategory"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Movement_idempotencyKey_key" ON "Movement"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Movement_teamId_type_occurredAt_idx" ON "Movement"("teamId", "type", "occurredAt");

-- CreateIndex
CREATE INDEX "Challenge_teamId_group_status_idx" ON "Challenge"("teamId", "group", "status");

-- CreateIndex
CREATE UNIQUE INDEX "XpAward_challengeId_key" ON "XpAward"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_teamId_badgeKey_sourceId_key" ON "Badge"("teamId", "badgeKey", "sourceId");

-- CreateIndex
CREATE INDEX "RewardChestConfig_teamId_idx" ON "RewardChestConfig"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "RewardChestOutcome_teamId_monthLabel_key" ON "RewardChestOutcome"("teamId", "monthLabel");

-- CreateIndex
CREATE UNIQUE INDEX "Reminder_icsUid_key" ON "Reminder"("icsUid");

-- CreateIndex
CREATE INDEX "Reminder_teamId_status_dueAt_idx" ON "Reminder"("teamId", "status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSubscription_userId_key" ON "CalendarSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSubscription_token_key" ON "CalendarSubscription"("token");

-- CreateIndex
CREATE UNIQUE INDEX "MonthClosing_teamId_monthLabel_key" ON "MonthClosing"("teamId", "monthLabel");
