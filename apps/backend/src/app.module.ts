import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { RolesGuard } from "./auth/guards/roles.guard";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { BatchesModule } from "./batches/batches.module";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    BatchesModule,
    ProductsModule,
    OrdersModule,
    DashboardModule,
    UploadsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Apply JwtAuthGuard globally FIRST so request.user is populated
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Then apply RolesGuard to enforce @Roles() metadata
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
