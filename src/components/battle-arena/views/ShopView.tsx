import React from "react";
import { ShoppingCart } from "lucide-react";

const ShopView = () => {
    return (
        <div className="flex-1 w-full max-w-5xl flex items-center justify-center text-slate-400 flex-col gap-4">
            <ShoppingCart className="w-16 h-16 opacity-20" />
            <p>Shop Coming Soon</p>
        </div>
    );
};

export default ShopView;
