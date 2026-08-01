"use client"
import Price from "@/components/Price";
import { singleProduct } from "@/data";
import { product1 } from "@/type";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";

const SingleProductPage = (val:any) => {

  const {id} = val.params;


  const { isPending, error, data } = useQuery<product1>({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch(`http://localhost:3000/api/products/${id}`,{cache:'no-cache'}).then((res) =>
        res.json(),
      ),
  })



console.log(data?.title);
 
if (isPending) return <p>loading</p>

if (error) return <p>error happened</p>

  return (
   data && !isPending &&
   <div className="p-4 lg:px-20 xl:px-40 h-screen flex flex-col justify-around text-red-500 md:flex-row md:gap-8 md:items-center">
   { data.img && (
     <div className="relative w-full h-1/2 md:h-[70%]">
       <Image
         src={data.img}
         alt=""
         className="object-contain"
         fill
       />
     </div>
   )}
   {/* TEXT CONTAINER */}
   <div className="h-1/2 flex flex-col gap-4 md:h-[70%] md:justify-center md:gap-6 xl:gap-8">
     <h1 className="text-3xl font-bold uppercase xl:text-5xl">{data.title}</h1>
     <p>{data.desc}</p>
     {
      data.options.length  ?<Price price={data.price} id={data.id} options={data.options} title={data.title}/> : <Price price={data.price} id={data.id} title={data.title} />
     }
    
   </div>
 </div>
  );
};

export default SingleProductPage;
