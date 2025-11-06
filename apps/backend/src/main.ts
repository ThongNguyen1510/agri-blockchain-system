import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as express from "express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Tăng giới hạn body size cho JSON và raw body
    bodyParser: true,
  });

  // Tăng giới hạn body size cho JSON requests (để upload file lớn)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const defaults = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3004",
  ];
  const fromEnv = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((o) => o.trim()).filter(Boolean)
    : [];
  const allowedOrigins = Array.from(new Set([...defaults, ...fromEnv]));
  console.log("CORS allowed origins:", allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      // Some browsers send lowercase header names in preflight
      "authorization",
      // Cho phép frontend gửi ví đang kết nối để backend đối chiếu
      "x-wallet-address",
      "X-Wallet-Address",
    ],
    exposedHeaders: ["Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Serve uploaded files
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  const config = new DocumentBuilder()
    .setTitle("AgroChain API")
    .setDescription("API documentation for the AgroChain marketplace backend")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
