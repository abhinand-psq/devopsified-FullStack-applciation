import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useStore } from "./Store";
import { datas } from "@/type";

const CartIcon = () => {

  const datas:datas = useStore((state:any) => state.datas)

  return (
    <Link href="/cart" className="flex items-center gap-4">
      <div className="relative w-8 h-8 md:w-5 md:h-5">
        <Image src="/cart.png" alt="" fill />
      </div>
      <span>Carts ({datas.length})</span>
    </Link>
  );
};

export default CartIcon;
