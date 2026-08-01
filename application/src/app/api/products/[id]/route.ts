import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server"
const prisma = new PrismaClient()


export const GET = async(req:NextRequest,url:any) => {
   const {id} = url.params;
   try{
    const val = await prisma.product.findUnique({where:{id:id}})
    return new NextResponse(JSON.stringify(val),{status:200})
   }catch(e){
    return new NextResponse("error happend",{status:400})
   }
    

}