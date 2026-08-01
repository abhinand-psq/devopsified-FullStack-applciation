"use client"
import React, { useState } from 'react'

type sample = {
    title:string,
    additionalPrice:number,
}

function page() {
const [first, setfirst] = useState<sample[]>([])
const [option,setoption] = useState<string>('')
const [prize,setprize] = useState<string>('')

const handleadd = (e:React.MouseEvent<HTMLButtonElement>  ) =>{
e.preventDefault()
setfirst((state:any)=>{
 return(
    [...state,{title:option,additionalPrice:parseInt(prize)}]
 ) 
})
}

const submitfile = async(e:React.FormEvent<HTMLFormElement>) => {
e.preventDefault()
const target = e.target as HTMLFormElement;
const name = (target[0] as HTMLInputElement).value; 
const description = (target[1] as HTMLInputElement).value; 
const prize = (target[2] as HTMLInputElement).value; 
const cato = (target[3] as HTMLInputElement).value; 
 await fetch('http://localhost:3000/api/products',{body:JSON.stringify({title:name,desc:description,price:parseInt(prize),isFeatured:false,options:first,catSlug:cato,}),method:'POST',headers:{'Content-type':'application/json'}})
}

  return (
<form action=" " onSubmit={submitfile}>
<div className='flex justify-center w-full  pt-5 h-screen '>
     <div className='flex flex-col  w-4/5'>
      <div className='my-4 flex flex-col'>
        <label htmlFor="">title</label>
        <input type="text" className='border-2 w-4/5 p-4 '/>
      </div>
      <div className='my-4 flex flex-col'>
      <label htmlFor="">Description</label>
        <input type="text" className='border-2 w-4/5 p-4'/>
      </div>
      <div className='my-4 flex flex-col'>
      <label htmlFor="">prize</label>
        <input type="number" className='border-2 4px w-4/5 p-4'/>
      </div>
      <div className='my-4 flex flex-col'>
      <label htmlFor="">cateogary</label>
        <input type="text" className='border-2 4px w-4/5 p-4'/>
      </div>
      <label htmlFor="">options</label>
      <div className='my-4' >
        <input type="text" onChange={(e)=>{setoption(e.target.value)}} className='border 4px w-80 p-4'/>
        <input type="number" onChange={(e)=>{setprize(e.target.value)}} className='border 4px w-80 p-4'/>
        <button onClick={handleadd} className='border-2 p-4 bg-red-500'>add option</button>
      </div>
      <div className='my-4 flex'>
        
{
    first.map((res)=>{
        return(
           
             <div className='flex gap-1 p-2  bg-slate-500 me-3'>
             <p >{`${res.title}  `}</p>
             <p>{`$${res.additionalPrice}  `}</p>
             <button onClick={()=>{
                let a = first.filter((resp)=>resp.title != res.title)
                console.log(a)
                setfirst(a)
             }}>x</button>
             </div>
          
        )
    })
}
      </div>
      <div className='my-4'>
      <button type='submit' className='border-2 p-4 px-20 bg-red-500'>submit</button>
      </div>
    </div>
   </div>
</form>
  )
}

export default page