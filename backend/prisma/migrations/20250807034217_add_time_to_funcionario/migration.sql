/*
  Warnings:

  - Added the required column `time` to the `Funcionario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Funcionario" ADD COLUMN     "time" TEXT NOT NULL;
