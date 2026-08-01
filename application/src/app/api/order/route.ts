import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import { URL } from "url";
import { getServerSession } from "next-auth";
import authOptions from "@/components/auth";

const prisma = new PrismaClient()

export const GET = async(req:NextRequest)=>{
 let data =await  getServerSession(authOptions)
 console.log( data?.user);
 if(data?.user){
    try{
        if(data.user.isadmin){
           const dayas = await prisma.order.findMany()
            return new NextResponse(JSON.stringify(dayas),{status:200})
        }else{
            const dayas = await prisma.order.findMany({where:{userEmail:data.user.email!}})
            return new NextResponse(JSON.stringify(dayas),{status:200})
        }
        
     }catch{
        return new NextResponse(JSON.stringify("error"),{status:400})
     }
 }else{
    
        return new NextResponse(JSON.stringify("not authenticated"),{status:400})
      }
 
}

export const PUT = async(req:NextRequest)=>{
    const vale = await req.json()
    console.log(vale);
    const result = await prisma.order.update({where:{id:vale.id},data:{status:vale.status}})
    console.log(result);
    
    return new NextResponse(JSON.stringify("not authenticated"),{status:200})
    }
    

    export const POST = async(req:NextRequest)=>{
        const vale = await req.json()
        console.log(vale);
       try{
        const result = await prisma.order.create({data:vale})
        console.log(result);
        
        return new NextResponse(JSON.stringify(result),{status:200})
       }catch(e){
        console.log(e);
        return new NextResponse(JSON.stringify("error"),{status:400})
       }     
        }
        