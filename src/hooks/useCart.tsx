import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart: string | null =
      localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const response = await api.get(`/products/${productId}`);

      let isInCart = false;
      cart.forEach((value) => {
        if (value.id === productId) {
          isInCart = true;
          updateProductAmount({
            productId: value.id,
            amount: value.amount + 1,
          });
          return;
        }
      });
      if (isInCart) {
        return;
      }
      const newValue = [...cart, { ...response.data, amount: 1 }];
      setCart(newValue);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newValue));
    } catch (e) {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const isInCart = cart.find((value) => value.id === productId);
      if (!isInCart) {
        toast.error("Erro na remoção do produto");
        return;
      }

      const newValue = cart.filter((value) => value.id != productId);
      setCart(newValue);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newValue));
    } catch (e) {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const response = await api.get(`/stock/${productId}`);
      const { amount: stockAmount } = response.data;
      if (amount === 0) {
        return;
      }
      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return false;
      }
      const newValue = cart.map((value) => {
        if (value.id === productId) {
          return {
            ...value,
            amount: amount,
          };
        }
        return value;
      });
      setCart(newValue);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newValue));
      return true;
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  useEffect(() => {}, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
