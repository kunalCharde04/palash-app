import { prisma } from "@palash/db-client";
import { UserData } from "../../@types/types.js";


class ProfileServices {
    async fetchProfile(user: any): Promise<any> {
        return prisma.user.findUnique({
            where: {
                id: user.userId
            }
        })
    }

    async updateProfile(userId: string, userData: Partial<UserData>): Promise<any> {
        const user = await prisma.user.findFirst({ where: { OR: [{ username: userData.username }, { 'phone_or_email': userData.phone_or_email }] } });
        if (user && user.id !== userId) {
            throw new Error("Duplicate Username or email");
        }

        let fieldsToUpdated: any = {};
        for (let key of Object.keys(userData) as Array<keyof UserData>) {
            if (userData[key]) {
                // Handle date_of_birth field mapping and conversion
                if (key === 'dob') {
                    const dobValue = userData[key];
                    if (dobValue && dobValue.trim() !== '') {
                        try {
                            fieldsToUpdated['date_of_birth'] = new Date(dobValue);
                        } catch (error) {
                            throw new Error("Invalid date format for date of birth");
                        }
                    }
                } else {
                    fieldsToUpdated[key] = userData[key];
                }
            }
        }
        return await prisma.user.update({
            where: {
                id: userId
            },
            data: fieldsToUpdated
        })
    }

}

export default ProfileServices;