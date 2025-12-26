import { hash, compare } from 'bcrypt'

// hash edilmƏsi üçün istifadə olunan funksiya
export const hashPassword = async (password: string): Promise<string> => {
    return await hash(password, 10)
}

// hash edilmiş parolun yoxlanılması üçün istifadə olunan funksiya
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await compare(password, hashedPassword)
}

