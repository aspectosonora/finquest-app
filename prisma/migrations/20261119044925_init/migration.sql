-- CreateEnum
CREATE TYPE "AvatarKey" AS ENUM ('JULIO', 'CINTHYA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SplitScope" AS ENUM ('TEAM_DEFAULT', 'GOAL');

-- CreateEnum
CREATE TYPE "IncomeType" AS ENUM ('FIXED', 'RECEIVABLE_CLIENT', 'EXTRA');

-- CreateEnum
CREATE TYPE "IncomeFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ONE_TIME', 'IRREGULAR');

-- CreateEnum
CREATE TYPE "IncomeSourceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IncomePaymentStatus" AS ENUM ('PENDING', 'OVERDUE', 'PARTIAL', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DebtCategory" AS ENUM ('LIVERPOOL', 'CAR_LOAN', 'CREDIT_CARD', 'PERSONAL_LOAN', 'INSTALLMENTS', 'LATE_PAYMENTS', 'OTHER');

-- CreateEnum
CREATE TYPE "DebtStatus" AS ENUM ('UNCONFIGURED', 'ACTIVE', 'DEFEATED');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('HOME', 'TRAVEL', 'VEHICLE', 'TECH', 'EMERGENCY_FUND', 'EXPERIENCES', 'PROJECTS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GoalMode" AS ENUM ('BY_DATE', 'BY_BUDGET');

-- CreateEnum
CREATE TYPE "CommitmentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INCOME_RECEIVED', 'EXPENSE', 'DEBT_PAYMENT', 'GOAL_CONTRIBUTION', 'SALARY_RELEASE', 'REWARD_CHEST_PAYOUT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "ChallengeGroup" AS ENUM ('INITIAL', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "BadgeSource" AS ENUM ('CHALLENGE', 'DEBT_DEFEATED', 'GOAL_COMPLETED', 'SEASON');

-- CreateEnum
CREATE TYPE "RewardChestChoice" AS ENUM ('EXPERIENCE', 'OUTING', 'SALARY_BOOST', 'SAVE', 'GOAL_CONTRIBUTION');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('PAYMENT_DUE', 'DEBT_DUE', 'RECEIVABLE_PENDING', 'GOAL_CONTRIBUTION', 'CHALLENGE_ENDING', 'MONTH_CLOSE', 'TEAM_MEETING');

-- CreateEnum
CREATE TYPE "ReminderLeadTime" AS ENUM ('ONE_DAY', 'THREE_DAYS', 'ONE_WEEK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'DISMISSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Nuestro equipo',
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "timezone" TEXT NOT NULL DEFAULT 'America/Hermosillo',
    "locale" TEXT NOT NULL DEFAULT 'es-MX',
    "inviteCode" TEXT NOT NULL,
    "inviteCodeExpiresAt" TIMESTAMP(3),
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatarKey" "AvatarKey" NOT NULL DEFAULT 'CUSTOM',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Split" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "scope" "SplitScope" NOT NULL DEFAULT 'TEAM_DEFAULT',
    "goalId" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Split_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SplitShare" (
    "id" TEXT NOT NULL,
    "splitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,

    CONSTRAINT "SplitShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomeSource" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "IncomeType" NOT NULL,
    "name" TEXT NOT NULL,
    "isVariable" BOOLEAN NOT NULL DEFAULT false,
    "amountCents" INTEGER,
    "frequency" "IncomeFrequency" NOT NULL DEFAULT 'MONTHLY',
    "expectedDay" INTEGER,
    "status" "IncomeSourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomePayment" (
    "id" TEXT NOT NULL,
    "incomeSourceId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "receivedAmountCents" INTEGER NOT NULL DEFAULT 0,
    "expectedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "status" "IncomePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "category" "DebtCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
    "initialAmountCents" INTEGER NOT NULL DEFAULT 0,
    "interestRateBp" INTEGER,
    "dueDayOfMonth" INTEGER,
    "monthlyPaymentCents" INTEGER,
    "frequency" "IncomeFrequency" NOT NULL DEFAULT 'MONTHLY',
    "status" "DebtStatus" NOT NULL DEFAULT 'UNCONFIGURED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "configuredAt" TIMESTAMP(3),
    "defeatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebtPayment" (
    "id" TEXT NOT NULL,
    "debtId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "principalCents" INTEGER NOT NULL,
    "interestCents" INTEGER NOT NULL DEFAULT 0,
    "isExtraordinary" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebtPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "GoalCategory" NOT NULL,
    "photoUrl" TEXT,
    "targetAmountCents" INTEGER NOT NULL,
    "mode" "GoalMode" NOT NULL DEFAULT 'BY_DATE',
    "targetDate" TIMESTAMP(3),
    "monthlyBudgetCents" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalContribution" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "contributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalSalaryConfig" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "desiredAmountCents" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalSalaryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryRelease" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "monthLabel" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "SalaryRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commitment" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "dueDayOfMonth" INTEGER NOT NULL,
    "recurrence" "IncomeFrequency" NOT NULL DEFAULT 'MONTHLY',
    "category" TEXT,
    "linkedDebtId" TEXT,
    "autoGenerate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommitmentInstance" (
    "id" TEXT NOT NULL,
    "commitmentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "paidAmountCents" INTEGER NOT NULL DEFAULT 0,
    "status" "CommitmentStatus" NOT NULL DEFAULT 'PENDING',
    "monthLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitmentInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "monthlyLimitCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "MovementType" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "category" TEXT,
    "note" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedDebtId" TEXT,
    "relatedGoalId" TEXT,
    "relatedIncomePaymentId" TEXT,
    "relatedBudgetCategoryId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "group" "ChallengeGroup" NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "targetCount" INTEGER NOT NULL DEFAULT 1,
    "progressCount" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "status" "ChallengeStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XpAward" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "badgeKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" "BadgeSource" NOT NULL,
    "sourceId" TEXT,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardChestConfig" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "percentOfSurplus" INTEGER NOT NULL DEFAULT 20,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardChestConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardChestOutcome" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "monthLabel" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "amountCents" INTEGER,
    "choice" "RewardChestChoice",
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardChestOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "ReminderType" NOT NULL,
    "title" TEXT NOT NULL,
    "relatedDebtId" TEXT,
    "relatedGoalId" TEXT,
    "relatedIncomeSourceId" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "leadTime" "ReminderLeadTime" NOT NULL DEFAULT 'ONE_DAY',
    "customLeadMinutes" INTEGER,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "icsUid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "CalendarSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthClosing" (
    "id" TEXT NOT NULL,
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
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthClosing_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Split" ADD CONSTRAINT "Split_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SplitShare" ADD CONSTRAINT "SplitShare_splitId_fkey" FOREIGN KEY ("splitId") REFERENCES "Split"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SplitShare" ADD CONSTRAINT "SplitShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeSource" ADD CONSTRAINT "IncomeSource_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomeSource" ADD CONSTRAINT "IncomeSource_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomePayment" ADD CONSTRAINT "IncomePayment_incomeSourceId_fkey" FOREIGN KEY ("incomeSourceId") REFERENCES "IncomeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebtPayment" ADD CONSTRAINT "DebtPayment_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalContribution" ADD CONSTRAINT "GoalContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalSalaryConfig" ADD CONSTRAINT "PersonalSalaryConfig_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalSalaryConfig" ADD CONSTRAINT "PersonalSalaryConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRelease" ADD CONSTRAINT "SalaryRelease_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryRelease" ADD CONSTRAINT "SalaryRelease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitmentInstance" ADD CONSTRAINT "CommitmentInstance_commitmentId_fkey" FOREIGN KEY ("commitmentId") REFERENCES "Commitment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitmentInstance" ADD CONSTRAINT "CommitmentInstance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpAward" ADD CONSTRAINT "XpAward_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpAward" ADD CONSTRAINT "XpAward_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardChestConfig" ADD CONSTRAINT "RewardChestConfig_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardChestOutcome" ADD CONSTRAINT "RewardChestOutcome_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarSubscription" ADD CONSTRAINT "CalendarSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthClosing" ADD CONSTRAINT "MonthClosing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
