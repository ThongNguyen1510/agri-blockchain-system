import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/user-role.enum";
import { CertificationsService } from "./certifications.service";
import { CreateCertificationDto } from "./dto/create-certification.dto";
import { CertificationDto } from "./dto/certification.dto";

/**
 * Controller quản lý chứng nhận
 * Endpoints để tạo, xem, xác minh chứng nhận cho batch và product
 */
@ApiTags("certifications")
@ApiBearerAuth()
@Controller()
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  /**
   * Tạo chứng nhận mới (Seller hoặc Admin)
   * POST /certifications
   */
  @Roles(UserRole.Seller, UserRole.Admin)
  @Post("certifications")
  async createCertification(
    @Body() dto: CreateCertificationDto,
  ): Promise<CertificationDto> {
    return this.certificationsService.createCertification(dto);
  }

  /**
   * Lấy tất cả chứng nhận của một batch
   * GET /batches/:batchId/certifications
   */
  @Get("batches/:batchId/certifications")
  async getBatchCertifications(
    @Param("batchId", ParseIntPipe) batchId: number,
  ): Promise<CertificationDto[]> {
    return this.certificationsService.getBatchCertifications(batchId);
  }

  /**
   * Lấy tất cả chứng nhận của một product
   * GET /products/:productId/certifications
   */
  @Get("products/:productId/certifications")
  async getProductCertifications(
    @Param("productId", ParseIntPipe) productId: number,
  ): Promise<CertificationDto[]> {
    return this.certificationsService.getProductCertifications(productId);
  }

  /**
   * Lấy chi tiết một chứng nhận
   * GET /certifications/:id
   */
  @Get("certifications/:id")
  async getCertification(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<CertificationDto> {
    return this.certificationsService.getCertification(id);
  }

  /**
   * Xác minh chứng nhận (chỉ Admin)
   * PATCH /certifications/:id/verify
   */
  @Roles(UserRole.Admin)
  @Patch("certifications/:id/verify")
  async verifyCertification(
    @Param("id", ParseIntPipe) id: number,
    @Body("verified") verified: boolean,
  ): Promise<CertificationDto> {
    return this.certificationsService.verifyCertification(id, verified);
  }

  /**
   * Kiểm tra chứng nhận có hết hạn không
   * GET /certifications/:id/is-expired
   */
  @Get("certifications/:id/is-expired")
  async isExpired(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ expired: boolean }> {
    const expired = await this.certificationsService.isExpired(id);
    return { expired };
  }

  /**
   * Xóa chứng nhận (Admin hoặc Seller owner)
   * DELETE /certifications/:id
   */
  @Roles(UserRole.Seller, UserRole.Admin)
  @Delete("certifications/:id")
  async deleteCertification(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.certificationsService.deleteCertification(id);
    return { message: "Đã xóa chứng nhận thành công" };
  }
}
