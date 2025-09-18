export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export type Product = {
  id: string
  name: string
  description?: string
  priceUsd: number
  imageUrl: string
  stockQuantity?: number
  category?: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type CartItem = {
  product: Product
  quantity: number
}

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean
}

export type Order = {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  shippingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export type OrderItem = {
  id: string
  orderId: string
  productId: string
  quantity: number
  priceAtTime: number
  product: Product
}

export type Address = {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}


