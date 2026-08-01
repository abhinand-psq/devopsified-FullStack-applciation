"use client"
import { useStore } from "@/components/Store";
import { datas } from "@/type";
import { data } from "jquery";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const CartPage = () => {

  const {data:session} = useSession()

const [first, setfirst] = useState(0)

  const datas:datas = useStore((state:any) => state.datas)
  const  remove = useStore((state:any) => state.remove)
  console.log(datas.length);
  
  useEffect(()=>{
   
  },[remove,datas,first])

let sum = 0
  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-9rem)] flex flex-col text-red-500 lg:flex-row">
      {/* PRODUCTS CONTAINER */}
      <div className="h-1/2 p-4 flex flex-col justify-center overflow-scroll lg:h-full lg:w-2/3 2xl:w-1/2 lg:px-20 xl:px-40">
    
        {/* SINGLE ITEM */}
        {
        datas.length ?  datas.map((res)=>{
          sum = sum +res.price  
            return(
              <div className="flex items-center justify-between mb-4">
          <Image src="/temporary/p1.png" alt="" width={100} height={100} />
          <div className="">
            <h1 className="uppercase text-xl font-bold">{res.titles}</h1>
            <span>{res.titleopt}</span>
            <span>{` ${res.quantity}`}</span>
          </div>
          <h2 className="font-bold">{res.price}</h2>
          <span className="cursor-pointer" onClick={()=>{remove(res.id)}}>X</span>
        </div>
            )
          }):<p>add anything to cart</p>
        }
      
      </div>
      {/* PAYMENT CONTAINER */}
      <div className="h-1/2 p-4 bg-fuchsia-50 flex flex-col gap-4 justify-center lg:h-full lg:w-1/3 2xl:w-1/2 lg:px-20 xl:px-40 2xl:text-xl 2xl:gap-6">
        <div className="flex justify-between">
          <span className="">Subtotal {`${datas.length}`}</span>
          <span className="">{sum}</span>
        </div>
        <div className="flex justify-between">
          <span className="">Service Cost</span>
          <span className="">$0.00</span>
        </div>
        <div className="flex justify-between">
          <span className="">Delivery Cost</span>
          <span className="text-green-500">FREE!</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between">
          <span className="">TOTAL(INCL. VAT)</span>
          <span className="font-bold">{sum}</span>
        </div>
        <button onClick={()=>{fetch('http://localhost:3000/api/order',{method:'POST',body:JSON.stringify({price:sum,products:datas,status:'pending',userEmail:session?.user.email}),headers:{'Content-type':'application/json'}})}} className="bg-red-500 text-white p-3 rounded-md w-1/2 self-end">
          CHECKOUT
        </button>
      </div>
    </div>
  );
};

export default CartPage;
