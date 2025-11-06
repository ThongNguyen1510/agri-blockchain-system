import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, Req } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import type { Request } from "express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import * as fs from "fs";
import * as crypto from "crypto";

function filenameFactory(req: any, file: any, cb: (error: Error | null, filename: string) => void) {
  const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = extname(file.originalname) || ".bin";
  cb(null, `${unique}${ext}`);
}

@ApiTags("uploads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("uploads")
export class UploadsController {
  @Post("image")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => cb(null, "uploads"),
        filename: filenameFactory,
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    })
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } })
  async uploadImage(@UploadedFile() file: any, @Req() req: Request) {
    // Ensure uploads directory exists
    try { fs.mkdirSync("uploads", { recursive: true }); } catch {}
    const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`;
    return { url: `${base}/uploads/${file.filename}` };
  }

  /**
   * Upload batch document (chứng từ) và tạo IPFS CID + SHA-256 hash
   * Endpoint: POST /uploads/batch-document
   */
  @Post("batch-document")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Đảm bảo thư mục tồn tại trước khi lưu
          const uploadDir = "uploads/batch-documents";
          try { 
            fs.mkdirSync(uploadDir, { recursive: true }); 
          } catch {}
          cb(null, uploadDir);
        },
        filename: filenameFactory,
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cho chứng từ
    })
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } })
  async uploadBatchDocument(@UploadedFile() file: any, @Req() req: Request) {
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Multer đã lưu file vào file.path, đọc từ đó
    const fileBuffer = fs.readFileSync(file.path);
    const hashSha256 = "0x" + crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // Tạo mock IPFS CID (trong production, upload lên Pinata/IPFS thật)
    // Format: Qm + base58 encoded hash
    const ipfsCid = `Qm${crypto.randomBytes(22).toString("base64").replace(/[+/=]/g, "")}`;

    // URL để truy cập file
    const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${base}/uploads/batch-documents/${file.filename}`;

    return {
      ipfsCid,
      hashSha256,
      fileUrl,
      filename: file.originalname,
      size: file.size,
    };
  }
}
