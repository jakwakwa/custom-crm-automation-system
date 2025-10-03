/*
  Warnings:

  - You are about to drop the column `name` on the `OutreachSequence` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `SequenceStep` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SequenceStep" DROP CONSTRAINT "SequenceStep_templateId_fkey";

-- DropIndex
DROP INDEX "public"."SequenceStep_templateId_idx";

-- AlterTable
ALTER TABLE "OutreachSequence" DROP COLUMN "name",
ADD COLUMN     "sequenceTemplateId" TEXT;

-- AlterTable
ALTER TABLE "SequenceStep" DROP COLUMN "templateId",
ADD COLUMN     "messageTemplateId" TEXT;

-- CreateTable
CREATE TABLE "SequenceTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SequenceTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SequenceTemplateStep" (
    "id" TEXT NOT NULL,
    "sequenceTemplateId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "template" TEXT NOT NULL,
    "subject" TEXT,
    "messageTemplateId" TEXT,
    "delayDays" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SequenceTemplateStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SequenceTemplate_isActive_idx" ON "SequenceTemplate"("isActive");

-- CreateIndex
CREATE INDEX "SequenceTemplate_createdAt_idx" ON "SequenceTemplate"("createdAt");

-- CreateIndex
CREATE INDEX "SequenceTemplateStep_sequenceTemplateId_idx" ON "SequenceTemplateStep"("sequenceTemplateId");

-- CreateIndex
CREATE INDEX "SequenceTemplateStep_messageTemplateId_idx" ON "SequenceTemplateStep"("messageTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "SequenceTemplateStep_sequenceTemplateId_stepNumber_key" ON "SequenceTemplateStep"("sequenceTemplateId", "stepNumber");

-- CreateIndex
CREATE INDEX "OutreachSequence_sequenceTemplateId_idx" ON "OutreachSequence"("sequenceTemplateId");

-- CreateIndex
CREATE INDEX "SequenceStep_messageTemplateId_idx" ON "SequenceStep"("messageTemplateId");

-- AddForeignKey
ALTER TABLE "SequenceTemplateStep" ADD CONSTRAINT "SequenceTemplateStep_sequenceTemplateId_fkey" FOREIGN KEY ("sequenceTemplateId") REFERENCES "SequenceTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceTemplateStep" ADD CONSTRAINT "SequenceTemplateStep_messageTemplateId_fkey" FOREIGN KEY ("messageTemplateId") REFERENCES "MessageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachSequence" ADD CONSTRAINT "OutreachSequence_sequenceTemplateId_fkey" FOREIGN KEY ("sequenceTemplateId") REFERENCES "SequenceTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SequenceStep" ADD CONSTRAINT "SequenceStep_messageTemplateId_fkey" FOREIGN KEY ("messageTemplateId") REFERENCES "MessageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
