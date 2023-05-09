import {products} from './products.js'

// Variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
// console.log(parseFloat(cartTotal.innerHTML) + 5.8 + 10)
const cartContent = document.querySelector('.cart-content')
const productDOM = document.querySelector('.products-center')


let cart = [];
// console.log(cart)
// Getting the products 
class Products{
    async getProducts(){
        try{
            let fetchProducts = await fetch('./products.json')
            // console.log(fetchProducts)
            let data = await fetchProducts.json()
            // console.log(data)
            let products = data.items
            // console.log(products)
            products = products.map(item => {
                const {title , price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title , price , id , image}
            })
            return products
        }catch(error){
            console.log(error)
        }
    }
}

// display Products
class UI{
    displayProducts(products){
        let result = ""
        products.forEach(product => {
            result += `
            <div class="product">
            <div class="img-container">
              <img src=${product.image} class="product-img" alt="" />
              <div class="bag-btn" data-id=${product.id}>
                <i
                  class="nav-icon cart-btn fa fa-shopping-cart"
                  aria-hidden="true"
                ></i>
                add To Cart
              </div>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
          </div>
          `
        })
        productDOM.innerHTML = result
    }

    // Get Product from localStorage
    addProductsToCart(){
        const buttons = [...document.querySelectorAll('.bag-btn')]
        // console.log(buttons)
        buttons.forEach(button => {
            const id = button.dataset.id
            let isInCard = cart.find(item => item.id === id)
            if(isInCard){
                button.innerText = 'In Card'
                button.disabled = true
            }
            button.addEventListener('click' , event=>{
                event.target.innerText = 'In Card'
                event.target.disabled = true
                let addeddItem = {...Storage.getProduct(id) , amount : 1}
                cart = [...cart , addeddItem]
                Storage.saveCart(cart)
                this.updateValuesCart(addeddItem)
                this.addToCardItem(addeddItem)
            })

        })

    }

    updateValuesCart(item){
        let cartItemsDOM = parseInt(cartItems.innerHTML)
        let cartTotalDOM = parseFloat(cartTotal.innerHTML)
        console.log(cartTotalDOM)
        cartItemsDOM += item.amount
        cartTotalDOM += ((item.amount * item.price))
        cartItems.innerText = cartItemsDOM
        cartTotal.innerHTML = cartTotalDOM.toFixed(2)
    }

    
    addToCardItem(item){
        const container = document.createElement('div')
        container.classList.add('cart-item')
        container.innerHTML = `
        <img src=${item.image} class="" alt="product">
        <div>
          <h4>${item.title}</h4>
          <h5>${item.price}</h5>
          <i class="fas fa-trash remove-item data-id=${item.id}"></i>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
        `;
        cartContent.appendChild(container)
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
        

    }
    // add product to cart 
    //save cart to localStorage
    //update values
    setUpApp(){
        cart = Storage.getContentCard() || []
        cart.forEach(item => {
            this.addToCardItem(item)
            this.updateValuesCart(item)

        })
    }

}

// Local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem('products' , JSON.stringify(products))
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'))
        let product = products.find(product => {
            return product.id === id
        })
        return product
    }
    static saveCart(cart){
        localStorage.setItem('cart' , JSON.stringify(cart))
    }

    static getContentCard(){
        let cartItems = JSON.parse(localStorage.getItem('cart'))
        return cartItems
    }
}

document.addEventListener('DOMContentLoaded' , e => {
    const ui = new UI()
    const products = new Products()

    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
        ui.addProductsToCart()
        ui.setUpApp()
    })
})


closeCartBtn.addEventListener('click' , event =>{
    cartOverlay.classList.remove('transparentBcg')
    cartDOM.classList.remove('showCart')
})

cartBtn.addEventListener('click' , e => {
    cartOverlay.classList.add('transparentBcg')
    cartDOM.classList.add('showCart')
})