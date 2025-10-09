import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { BatchesService } from "./batches.service";
import { BatchesController } from "./batches.controller";

@Module({
  imports: [PrismaModule],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}

