import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CertificationsService } from "./certifications.service";
import { CertificationsController } from "./certifications.controller";

/**
 * Module quản lý chứng nhận (Certifications)
 * Cung cấp các API để tạo, xem, xác minh chứng nhận cho batch và product
 */
@Module({
  imports: [PrismaModule],
  controllers: [CertificationsController],
  providers: [CertificationsService],
  exports: [CertificationsService],
})
export class CertificationsModule {}
