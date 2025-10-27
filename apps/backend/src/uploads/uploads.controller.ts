import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, Req } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import type { Request } from "express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import * as fs from "fs";

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
}
