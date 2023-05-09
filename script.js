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
let buttonsDOM = []

class Products{
    async getProducts(){
        try {
            let result = await fetch('./products.json')
            let data = await result.json()
    
            let products = data.items;
            // console.log(products)
            products = products.map((item)=>{
                const example = item.fields.title
                const {title , price} = item.fields
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title , price , id , image}
            })
            return products
        } catch (error) {
            console.log(error)
        }

    }
}
class UI{
    displayProducts(products){
        products.forEach(product => {
           let div = document.createElement('div')
           div.classList.add('product')
           div.innerHTML = `
           <div class="img-container">
           <img src=${product.image} class="product-img" alt="" />
           <button class="bag-btn" data-id=${product.id}>
             <i
               class="nav-icon cart-btn fa fa-shopping-cart"
               aria-hidden="true"
             ></i>
             add To Cart
           </button>
         </div>
         <h3>${product.title}</h3>
         <h4>$${product.price}</h4>
        `
        productDOM.appendChild(div)
        });
    }
    addToCart(){
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = buttons
        buttons.forEach(button => {
            let id = button.dataset.id
            let isExistInCart = cart.find((item) => item.id === id)
            if(isExistInCart){
                button.disabled = true
                button.innerText = 'In Card'
            }else{
                button.addEventListener('click' , event => {
                    // console.log(event.target)
                    event.target.innerText = 'In Bag'
                    event.target.disabled = true
                    // Get product from products
                    let cartItem = {...Storage.getProduct(id) , amount : 1}
                    // Add product to cart
                    cart = [...cart , cartItem]
                    // Save Cart in Local Storage
                    Storage.saveCart(cart)
                    // Set cart Values
                    this.setCartvalues(cart)
                    // Dislay Cart item
                    this.addCartToDOM(cartItem)
                    // Show Cart
                    this.showCart()
                })
            }
        })
    }

    setCartvalues(cart){
        let totalItems = 0
        let totalAmount = 0
        cart.forEach(item => {
            totalItems += item.amount
            totalAmount += (item.amount * item.price) 
        })
        // console.log(totalAmount , totalItems)
        cartItems.innerText = totalItems
        cartTotal.innerText = parseFloat(totalAmount.toFixed(2))
    }

    addCartToDOM(cart){
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
        <img src="${cart.image}" class="" alt="product">
        <div>
          <h4>${cart.title}</h4>
          <h5>$${cart.price}</h5>
          <span class="remove-item" data-id=${cart.id}><i class="fas fa-trash"></i></span>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id="${cart.id}"></i>
          <p class="item-amount">${cart.amount}</p>
          <i class="fas fa-chevron-down" data-id="${cart.id}"></i>
        </div>
        `
        cartContent.appendChild(div)
    }

    setupApp(){
        cart = Storage.getCart()
        this.setCartvalues(cart)
        this.populateCart(cart)
        closeCartBtn.addEventListener('click' , this.hiddenCart)
        cartBtn.addEventListener('click' , this.showCart)
    }

    populateCart(cart){
        cart.forEach((item) => {
            this.addCartToDOM(item)
        })
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    hiddenCart(){
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    clearItems(){
        clearCartBtn.addEventListener('click' , event => {

        })
    }
    cartLogic(){
        clearCartBtn.addEventListener('click' , event =>{
            this.clearCartItems()
        })
        cartContent.addEventListener('click' , event => {
            // console.log(event.target)
            if(event.target.classList.contains('fa-trash')){
                let id = event.target.parentElement.dataset.id
                this.removeCartItem(id)
                event.target.closest('.cart-item').remove()
            }
            else if(event.target.classList.contains('fa-chevron-up')){
                let element = event.target
                this.cartIncreaseDecreaseProducts(element)
            }
            else if(event.target.classList.contains('fa-chevron-down')){
                let element = event.target
                this.cartIncreaseDecreaseProducts(element)
            }
        })
    }

    cartIncreaseDecreaseProducts(element){
        let id = element.dataset.id
        let cartItem = cart.find(item => item.id === id)
        let cartID = cartItem.id
        cart.map(item => {
            if(item.id === cartID && element.classList.contains('fa-chevron-up')){
                item.amount += 1
                element.nextElementSibling.innerText = item.amount
            }else if((item.id === cartID && element.classList.contains('fa-chevron-down'))){
                if(item.amount > 0){
                    item.amount -= 1
                    element.previousElementSibling.innerText = item.amount
                }else{
                    cartContent.removeChild(element.parentElement.parentElement)
                }
            }
        })
        Storage.saveCart(cart)
        this.setCartvalues(cart)
    }

    clearCartItems(){
        let cartItems = cart.map(item => {
           return item.id
        })
        cartItems.forEach((id) => {
            this.removeCartItem(id)
        })
        while(cartContent.children.length > 0){
            cartContent.children[0].remove()
        }
    }
    removeCartItem(id){
        cart = cart.filter(item => item.id !== id)
        Storage.saveCart(cart)
        this.setCartvalues(cart)
        console.log(cartContent.children)
        buttonsDOM.forEach(button => {
            if(button.dataset.id === id){
                button.innerHTML = `<i
                class="nav-icon cart-btn fa fa-shopping-cart"
                aria-hidden="true"
                ></i>
                add To Cart`
                button.disabled = false
            }
        })
        if(cartContent.children.length === 1){
            this.hiddenCart()
        }

    }
}
class Storage{
    static saveProducts(products){
        localStorage.setItem("products" , JSON.stringify(products))
    }

    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'))
        let product = products.find((product) => product.id === id)
        // console.log(product)
        return product 
    }

    static saveCart(cart){
        localStorage.setItem('cart' , JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener('DOMContentLoaded' , e =>{
    const products = new Products()
    const ui = new UI()
    ui.setupApp()
    products.getProducts().then((products) => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.addToCart()
        ui.cartLogic()
    })
})

