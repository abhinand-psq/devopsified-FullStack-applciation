import authOptions from "@/components/auth"
import NextAuth from "next-auth"

const auths = NextAuth(authOptions)

export {auths as POST,auths as GET}