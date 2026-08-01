export type product1 ={
    id:string   
    createdAt:number  
    title:string
    desc:string
    img:string
    price :number
   isFeatured:boolean
    options :[ { title: string; additionalPrice: number }]
    category:object
    catSlug :String
}

export type products ={
    id:string   
    createdAt:number  
    title:String
    desc:String
    img:string
    price :number
   isFeatured:boolean
    options :object
    category:object
    catSlug :String
}[]

export type cat={
    id:string
    createdAt:number
    title:String
    desc:string
    color:string
    img:string
    slug :string
    products:products
}[]

export type useradmin ={
    id: string
    name: string 
    email: string 
    emailVerified: Date 
    image: string 
    isAdmin: boolean
}

export type order={
    id   : string   
    createdAt : number
    price     :number
    products  :{title:string}[]
    status   : string
    intent_id: string
    user  :   object
    userEmail:string
}


export type datas = {
    titles:string,
     price:number,
     id:string,
     titleopt:string,
     quantity:string
}[]