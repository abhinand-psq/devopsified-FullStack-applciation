import { PrismaClient } from "@prisma/client"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions, User } from "next-auth"
import { useradmin } from "@/type"

 const prisma = new PrismaClient()

 declare module "next-auth" {
    interface Session {
      user: User& {isadmin:boolean};
    }
  }

  declare module "next-auth/jwt" {
    interface JWT {

      isAdmin?: boolean;
    }
  }

 export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
   session:{strategy:"jwt"},
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID !,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
 callbacks:{
   async session({session,token}) {
       if(token){
       
        session.user.isadmin = token.isAdmin as boolean
       }
       return session
    },
    async jwt({token,user,session}) {
       if(user){
        const useradmin =await prisma.user.findUnique({where:{id:user.id}}) as useradmin    
        token.isAdmin =useradmin.isAdmin
       }
        return token
    }
 } 
}

export default authOptions
