/*
  Warnings:

  - You are about to drop the column `user_id` on the `invite` table. All the data in the column will be lost.
  - Added the required column `role` to the `invite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "invite" DROP CONSTRAINT "invite_user_id_fkey";

-- AlterTable
ALTER TABLE "invite" DROP COLUMN "user_id",
ADD COLUMN     "author_id" TEXT,
ADD COLUMN     "role" "Role" NOT NULL;

-- AddForeignKey
ALTER TABLE "invite" ADD CONSTRAINT "invite_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
