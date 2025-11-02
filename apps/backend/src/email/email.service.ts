import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import { join } from "path";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    // Đảm bảo .env được load ngay cả khi ConfigModule chưa kịp tải
    dotenv.config({ path: join(process.cwd(), ".env") });
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const read = (key: string): string | undefined =>
      (this.configService.get<string>(key) ?? process.env[key]) as string | undefined;

    const rawEnabled = read("EMAIL_ENABLED");
    const host = read("EMAIL_HOST");
    const portRaw = read("EMAIL_PORT");
    const user = read("EMAIL_USER");
    const pass = read("EMAIL_PASS");

    const truthy = new Set(["true", "1", "yes", "on"]);
    const emailEnabled = rawEnabled
      ? truthy.has(String(rawEnabled).toLowerCase())
      : Boolean(host && user && pass);

    this.logger.log(
      `Email flags => EMAIL_ENABLED:"${rawEnabled}", resolved:${emailEnabled}, host:${host ? "set" : "missing"}, user:${user ? "set" : "missing"}`,
    );

    if (!emailEnabled) {
      this.logger.warn("Email service disabled. Emails will be logged to console.");
      return;
    }

    const port = typeof portRaw === "string" ? Number(portRaw) : (portRaw as number | undefined);

    if (!host || !port || !user || !pass) {
      this.logger.warn("Email configuration incomplete. Emails will be logged to console.");
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    this.logger.log("Email service initialized successfully");
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    // TEMP OVERRIDE: Force using localhost:3001 for reset link as requested
    const frontendUrl = "http://localhost:3001";
    this.logger.log(`Using FRONTEND_URL for reset link (forced): ${frontendUrl}`);
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const subject = "Đặt lại mật khẩu - AgroChain";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản AgroChain của mình.</p>
        <p>Click vào link bên dưới để đặt lại mật khẩu:</p>
        <p style="margin: 20px 0;">
          <a href="${resetLink}" 
             style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Link này sẽ hết hạn sau 15 phút.
        </p>
        <p style="color: #666; font-size: 14px;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          © 2025 AgroChain - Hệ thống blockchain nông sản
        </p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get<string>("EMAIL_FROM") || "noreply@agrochain.com",
          to,
          subject,
          html,
        });
        this.logger.log(`Password reset email sent to ${to}`);
      } catch (error) {
        this.logger.error(`Failed to send email to ${to}:`, error);
        throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
      }
    } else {
      // Development mode: log to console
      this.logger.log(`
========================================
📧 PASSWORD RESET EMAIL (DEV MODE)
========================================
To: ${to}
Subject: ${subject}
Reset Link: ${resetLink}
Token: ${token}
========================================
      `);
    }
  }
}
