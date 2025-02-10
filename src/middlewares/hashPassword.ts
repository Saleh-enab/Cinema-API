import bcrypt from 'bcrypt';

export const hashPassword = async (plainPassword: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(plainPassword, 12)
    return hashedPassword;
}