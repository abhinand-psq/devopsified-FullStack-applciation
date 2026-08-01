import { NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const GET = async()=>{
 try{
    const data =  await prisma.category.findMany()
    console.log(data);
    
    return new NextResponse(JSON.stringify(data),{status:200})
 }catch{
    return new NextResponse(JSON.stringify("error"),{status:400})
 }
}

