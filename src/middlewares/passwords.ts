import bcrypt from 'bcrypt';

export const hashPassword = async (plainPassword: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(plainPassword, 12)
    return hashedPassword;
}

export const validatePassword = async (enteredPassword: string, hashedPassword: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(enteredPassword, hashedPassword)
    return isMatch;
}