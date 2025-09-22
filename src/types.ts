export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export type Product = {
  id: string
  _id?: string // MongoDB ObjectId
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
  _id?: string // MongoDB ObjectId
  email: string
  firstName: string
  lastName: string
  isAdmin: boolean
  profile?: {
    phone?: string
  }
}

export type Order = {
  id: string
  _id?: string // MongoDB ObjectId
  userId: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export type OrderItem = {
  id: string
  _id?: string // MongoDB ObjectId
  orderId: string
  productId: string
  quantity: number
  priceAtTime: number
  product: Product
}



