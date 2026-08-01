import { create } from 'zustand'
import { persist } from "zustand/middleware";

export const useStore = create(persist((set) => ({
  datas:[],
  totalprize:0,

  Adddata: (value:any) =>{
      set((state:any) => (
        {datas:[...state.datas,value]}))
  },

    

remove:(ids:any)=>set((state:any)=>(
  {datas:state.datas.filter((res:any)=>res.id != ids)}))

}),{name:'sdf',}))
