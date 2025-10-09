import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { UserRole } from "../users/user-role.enum";
import { LoginDto } from "./dto/login.dto";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const userFixture = {
    id: 1,
    email: "demo@example.com",
    role: UserRole.Seller,
    walletAddress: "0x123",
    passwordHash: "$2a$10$abcdefghijklmnopqrstuv",
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(userFixture),
            findByEmail: jest.fn().mockResolvedValue(userFixture),
            findById: jest.fn().mockResolvedValue(userFixture),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("signed-token"),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    usersService = moduleRef.get(UsersService);
    jwtService = moduleRef.get(JwtService);

    jest.spyOn(usersService, "create");
    jest.spyOn(usersService, "findByEmail");
    jest.spyOn(usersService, "findById");
    jest.spyOn(jwtService, "sign");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("registers a new user with hashed password", async () => {
    const dto: RegisterDto = {
      email: "demo@example.com",
      password: "SuperSecret1!",
      role: UserRole.Seller,
      walletAddress: "0x123",
    };

    const result = await authService.register(dto);

    expect(usersService.create).toHaveBeenCalled();
    const createArgs = (usersService.create as jest.Mock).mock.calls[0][0];
    expect(createArgs.passwordHash).not.toEqual(dto.password);
    expect(result.accessToken).toBe("signed-token");
    expect(result.user.email).toBe(dto.email.toLowerCase());
  });

  it("logs in an existing user", async () => {
    const dto: LoginDto = {
      email: "demo@example.com",
      password: "SuperSecret1!",
    };

    const passwordHash = await bcrypt.hash(dto.password, 10);
    jest.spyOn(usersService, "findByEmail").mockResolvedValueOnce({
      ...userFixture,
      passwordHash,
    } as any);

    const result = await authService.login(dto);
    expect(result.accessToken).toBe("signed-token");
    expect(result.user.email).toBe(dto.email.toLowerCase());
  });

  it("throws on invalid credentials", async () => {
    jest.spyOn(usersService, "findByEmail").mockResolvedValue(null as any);

    await expect(
      authService.login({
        email: "missing@example.com",
        password: "wrong",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
