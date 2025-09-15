import { prisma } from "@palash/db-client";
import { SignInDTO, SignUpDTO, VerifyOtpDTO, RefreshTokenDTO } from "../../@types/interfaces.js";
import { generateOtp } from "../../utils/generate-otp.js";
import { deleteOtp, getOtpData, storeSignUpOtp, storeSignInOtp } from "../../utils/redis.utils.js";
import { sendMail } from "../../adapters/mailer.adapter.js";
import JWTService from "./jwt/jwt.service.js";
import { ValidationError } from "../../utils/errors.js";


class AuthServices {
    static async signUp(user: SignUpDTO) {

        const { name, phoneOrEmail } = user;

        const isUserExists = await prisma.user.findFirst({
            where: { "phone_or_email": phoneOrEmail },
        });

        if (isUserExists) {
            throw new ValidationError('Email already taken. Please try again with different email.');
        }

        const otp: string = generateOtp();

        const tempUser = {
            otp,
            name,
            username: phoneOrEmail, // Using phoneOrEmail as username for now
            phoneOrEmail,
            dob: new Date().toISOString(), // Default date of birth
            is_agreed_to_terms: user.is_agreed_to_terms,
        }

        await storeSignUpOtp(tempUser);
        await sendMail({ phoneOrEmail, otp });
        return { message: "OTP sent for signin." };
    }

    static async verifySignUpOtp(data: VerifyOtpDTO) {
        const { phoneOrEmail, otp } = data;

        const savedUser = await getOtpData(phoneOrEmail, "signup");
        if (!savedUser) throw new ValidationError("OTP expired. Please request a new OTP.");

        if (savedUser.otp !== otp) throw new ValidationError("Invalid Otp. Please try again.");

        await deleteOtp(phoneOrEmail, "signup");

        // Use a transaction to ensure atomicity
        return await prisma.$transaction(async (tx) => {
            // Create user within the transaction
            const user = await tx.user.create({
                data: {
                    phone_or_email: phoneOrEmail,
                    name: savedUser.name,
                    is_agreed_to_terms: Boolean(savedUser.is_agreed_to_terms) || true,
                    is_verified: Boolean(true)
                },
            });

            const jwtServiceInstance = new JWTService();
            const { accessToken, refreshToken } = await jwtServiceInstance.generateTokenPair(
                user.id,
                user.phone_or_email || '',
                'USER'
            );

            // Store refresh token in database within the same transaction
            await tx.refreshToken.create({
                data: {
                    token: refreshToken,
                    user_id: user.id,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            });

            return {
                message: "Signup successful.",
                accessToken,
                refreshToken,
                user: user
            };
        });
    }
    static async signIn(data: SignInDTO) {
        const { phoneOrEmail } = data;

        const user = await prisma.user.findUnique({ where: { phone_or_email: phoneOrEmail } });
        if (!user) throw new ValidationError("User not found. Please create an account.");

        const otp: string = generateOtp();

        await sendMail({ phoneOrEmail, otp });

        await storeSignInOtp({ otp, phoneOrEmail });

        return { message: "OTP sent for signin." };
    }

    static async verifySignInOtp(data: VerifyOtpDTO) {
        const { phoneOrEmail, otp } = data;
        return await prisma.$transaction(async (tx) => {
            const savedUser = await getOtpData(phoneOrEmail, "signin");
            if (!savedUser) throw new ValidationError("OTP expired. Please request a new OTP.");

            if (savedUser.otp !== otp) throw new ValidationError("Invalid Otp. Please try again.");

            await deleteOtp(phoneOrEmail, "signin");

            const user = await tx.user.findUnique({ where: { phone_or_email: phoneOrEmail } });
            if (!user) throw new ValidationError("User not found. Please create an account.");

            // Invalidate any existing refresh tokens for this user
            await tx.refreshToken.updateMany({
                where: { user_id: user.id, is_revoked: false },
                data: { is_revoked: true }
            });


            const jwtServiceInstance = new JWTService();


            const { accessToken, refreshToken } = await jwtServiceInstance.generateTokenPair(
                user.id,
                user.phone_or_email || '',
                user.role || 'USER'
            );



            // Store refresh token in database
            await tx.refreshToken.create({
                data: {
                    token: refreshToken,
                    user_id: user.id,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            });


            return {
                message: "Login successful.",
                accessToken,
                refreshToken,
                user: user
            };
        })

    }

    static async refreshToken(data: RefreshTokenDTO) {
        const { refreshToken } = data;

        // Verify the refresh token exists and is valid
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                is_revoked: false,
                expires_at: { gt: new Date() }
            },
            include: { user: true }
        });

        if (!storedToken) {
            throw new ValidationError("Invalid or expired refresh token. Please login again.");
        }

        const user = storedToken.user;

        // Generate new token pair
        const jwtServiceInstance = new JWTService();
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await jwtServiceInstance.generateTokenPair(user.id, user.phone_or_email || '', user.role);

        // Revoke the old refresh token
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { is_revoked: true }
        });

        // Store the new refresh token
        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                user_id: user.id,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        return {
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    static async logout(userId: string, refreshToken: string) {
        try {
            // Revoke the refresh token
            await prisma.refreshToken.updateMany({
                where: {
                    user_id: userId,
                    token: refreshToken,
                    is_revoked: false
                },
                data: { is_revoked: true }
            });

            return { message: "Logged out successfully" };
        } catch (err: any) {
            throw new Error(`${err.message}`);
        }
    }

    static async logoutAll(userId: string) {
        try {
            // Revoke all refresh tokens for this user
            await prisma.refreshToken.updateMany({
                where: {
                    user_id: userId,
                    is_revoked: false
                },
                data: { is_revoked: true }
            });

            return { message: "Logged out from all devices successfully" };
        } catch (err: any) {
            throw new Error(`${err.message}`);
        }
    }

    static async createNewAdmin(user: SignUpDTO) {
        const { name, phoneOrEmail } = user;

        const isUserExists = await prisma.user.findFirst({
            where: { "phone_or_email": phoneOrEmail },
        });

        if (isUserExists) {
            throw new ValidationError("Email already taken. Please try again with different email.");
        }

        const otp: string = generateOtp();

        const tempUser = {
            otp,
            name,
            username: phoneOrEmail, // Using phoneOrEmail as username for now
            phoneOrEmail,
            dob: new Date().toISOString(), // Default date of birth
            role: 'ADMIN'
        }

        await storeSignUpOtp(tempUser);

        await sendMail({ phoneOrEmail, otp });

        return { message: "OTP sent for admin registration." };
    }

    static async verifyAdminSignUpOtp(data: VerifyOtpDTO) {
        const { phoneOrEmail, otp } = data;

        return await prisma.$transaction(async (tx) => {
            const savedUser = await getOtpData(phoneOrEmail, "signup");
            if (!savedUser) throw new ValidationError("OTP expired. Please request a new OTP.");

            if (savedUser.otp !== otp) throw new ValidationError("Invalid Otp. Please try again.");

            await deleteOtp(phoneOrEmail, "signup");

            const user = await tx.user.create({
                data: {
                    phone_or_email: phoneOrEmail,
                    name: savedUser.name,
                    is_agreed_to_terms: Boolean(savedUser.is_agreed_to_terms) || true,
                    is_verified: Boolean(true),
                    role: 'ADMIN'
                },
            });

            const jwtServiceInstance = new JWTService();
            const { accessToken, refreshToken } = await jwtServiceInstance.generateTokenPair(user.id, phoneOrEmail, 'ADMIN');

            // Store refresh token in database
            await tx.refreshToken.create({
                data: {
                    token: refreshToken,
                    user_id: user.id,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            });

            return {
                message: "Admin registration successful.",
                accessToken,
                refreshToken,
                user: user
            };
        })

    }

    static async adminSignIn(data: SignInDTO) {
        const { phoneOrEmail } = data;

        const user = await prisma.user.findUnique({
            where: {
                phone_or_email: phoneOrEmail,
                role: 'ADMIN'
            }
        });

        if (!user) throw new ValidationError("Admin not found. Please register as admin.");

        const otp: string = generateOtp();

        await sendMail({ phoneOrEmail, otp });
        await storeSignInOtp({ otp, phoneOrEmail });

        return { message: "OTP sent for admin login." };
    }

    static async verifyAdminSignInOtp(data: VerifyOtpDTO) {
        const { phoneOrEmail, otp } = data;

        return await prisma.$transaction(async (tx) => {
            const savedUser = await getOtpData(phoneOrEmail, "signin");
            if (!savedUser) throw new ValidationError("OTP expired. Please request a new OTP.");

            if (savedUser.otp !== otp) throw new ValidationError("Invalid Otp. Please try again.");

            await deleteOtp(phoneOrEmail, "signin");

            const user = await tx.user.findUnique({
                where: {
                    phone_or_email: phoneOrEmail,
                    role: 'ADMIN'
                }
            });

            if (!user) throw new ValidationError("Admin not found. Please register as admin.");

            // Invalidate any existing refresh tokens for this admin
            await tx.refreshToken.updateMany({
                where: { user_id: user.id, is_revoked: false },
                data: { is_revoked: true }
            });

            const jwtServiceInstance = new JWTService();
            const { accessToken, refreshToken } = await jwtServiceInstance.generateTokenPair(user.id, phoneOrEmail, 'ADMIN');

            // Store refresh token in database
            await tx.refreshToken.create({
                data: {
                    token: refreshToken,
                    user_id: user.id,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            });

            return {
                message: "Admin login successful.",
                accessToken,
                refreshToken,
                user: user
            };
        })

    }
}

export default AuthServices;