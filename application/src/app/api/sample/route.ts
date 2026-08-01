import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth"
import authOptions from "@/components/auth"
import { getToken } from "next-auth/jwt"
import { headers } from 'next/headers'
const prisma = new PrismaClient()
const secret = process.env.NEXTAUTH_SECRET

export const GET = async(req:NextRequest)=>{

    const token = await getToken({ req, secret });

    const authHeader = req.headers.get('authorization');
    
   console.log(authHeader);
   
   
console.log(token);

    const session = await getServerSession(authOptions);
    console.log(session?.user);
    console.log("dsfibsdif");
    
    return new NextResponse(JSON.stringify("error"),{status:400})
 
}

