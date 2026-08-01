"use client"
import { order } from "@/type";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
const OrdersPage = () => {
  
  const {data:session}= useSession()

  const queryClient = useQueryClient();

  const {data,isLoading,error} =useQuery({
    queryKey:["value1"],
   queryFn:async ()=>{
    return await fetch('http://localhost:3000/api/order',{cache:'no-cache'}).then((res)=>res.json())
   },
  }) 

 const mutation = useMutation({
  mutationFn:async ({id,status}:{id:string,status:string})=>{
    return fetch('http://localhost:3000/api/order',{body:JSON.stringify({id,status}),method:'PUT',headers:{'Content-type':'application/json'}}).then((res)=>res.json())
  },
  onSuccess:()=>{
    alert("hello")
  queryClient.invalidateQueries({queryKey:['value1']})
  }
 })

  



  return (
    <div className="p-4 lg:px-20 xl:px-40">
      <table className="w-full border-separate border-spacing-3">
        <thead>
          <tr className="text-left">
            <th className="hidden md:block">Order ID</th>
            <th>Date</th>
            <th>Price</th>
            <th className="hidden md:block">Products</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
         
         {
          data?.map((res:order)=>{
            
            return(
              <tr key={res.id} className="text-sm md:text-base bg-red-50">
            <td className="hidden md:block py-6 px-1">1237861238721</td>
            <td className="py-6 px-1">{res.createdAt}</td>
            <td className="py-6 px-1">{res.price}</td>
           <div className="flex">
           {
              res?.products?.length > 1 ?  res?.products?.map((res)=>{
                return(
                
                   <td key={res.title} className="hidden md:block  px-1">{res.title}</td>
             
                )
              }) :
                <td className="hidden md:block py-6 px-1">{res.products[0].title}</td>
            }
           </div>
           
            <td className="py-6 px-1">{res.status}</td>
            <td className="py-6 px-7">
             <div className="flex">
             <button  onClick={() => {
          mutation.mutate({
            id: res.id,
            status:"preparing" ,
          })
        }} className="px-1">preparing</button>

              <button  onClick={() => {
          mutation.mutate({
            id: res.id,
            status:'delivered',
          })
        }} className="px-1">delivered</button>
             </div>
            </td>
          </tr>
            )
          })
         } 
          
        </tbody>
      </table>
    </div>
  );
};

export default OrdersPage;
