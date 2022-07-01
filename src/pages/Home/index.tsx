import React, { useState, useEffect } from "react";
import { MdAddShoppingCart } from "react-icons/md";

import { ProductList } from "./styles";
import { api } from "../../services/api";
import { formatPrice } from "../../util/format";
import { useCart } from "../../hooks/useCart";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    const idd = product.id;
    let newItem = {};
    if (sumAmount[idd]) {
      newItem = { [idd]: sumAmount[idd] + product.amount };
    } else {
      newItem = { [idd]: product.amount };
    }

    return { ...sumAmount, ...newItem };
  }, {} as CartItemsAmount);

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get("products");

      setProducts(
        response.data.map((value: Product): ProductFormatted => {
          return {
            ...value,
            priceFormatted: formatPrice(value.price),
          };
        })
      );
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    // TODO
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map((value, index) => {
        return (
          <li key={value.id}>
            <img src={value.image} alt="Tênis de Caminhada Leve Confortável" />
            <strong>{value.title}</strong>
            <span>{value.priceFormatted}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(value.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[value.id] || 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        );
      })}
    </ProductList>
  );
};

export default Home;
