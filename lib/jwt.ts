import { JwtPayload, verify } from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export function getValueAndVerify(token: string) {
    console.warn(`token-value: ${token}\nsecret-value: ${secret}`)
    try {
        return verify(token, secret) as JwtPayload;
    } catch(err) {
        console.error(err)
        console.error("ERRO NA VERIFICAÇÃO")
        return null;
    }
}