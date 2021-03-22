
export interface Person {
  lastname: string,
  firstname: string,
  id: string
}

export interface Store {
  displayName: string,
  address: string,
  phone: string,
  description: string,
  i18n: string,
  logo?: string,
  owners: Array<string>,
  locked?: boolean,
  deleted?: boolean
  defaultCurrency: string
}
export enum Measures {
  KG = "KG",
  GR = "GR",
  UNIT = "UNIT"
}
export interface Product {
  storeId?: string,
  img: string,
  name: string,
  labels?: Array<string>,
  description: string,
  price: number,
  currency: string,
  measure: Measures,
  deleted?: boolean,
  onProductUpdate?: (value: number) => void
}

export interface User {
  name: string,
  picture: string,
  phone: string,
  address: string,
  email: string,
  lastVisit?: Date
}

export enum OrderStatus {
  pending = 'pending',
  inProgress = 'in progress',
  inTransit = 'in transit',
  readyToBePicked = 'ready to pick',
  done = 'done'
}

export enum PaymentOptions {
  cash = 'cash',
  creditcard = 'creditcard'
}

export enum OrderType {
  shipment = 'shipment',
  pickup = 'pickup'
}

export interface OrderProduct {
  productId: string,
  measure: Measures,
  quantity?: string,
  weight?: string,
  name: string,
  labels: Array<string>,
  img: string,
  price: number,
  currency: string
}

export interface Order {
  id?: string,
  storeId: string,
  userId: string,
  userName: string,
  userEmail: string,
  userAddress?: string,
  userPhone: string,
  userImage: string,
  paymentOption: PaymentOptions,
  isPaid: boolean,
  paidWith?: PaymentOptions,
  products: Array<OrderProduct>,
  status: OrderStatus,
  isDone: boolean,
  price: number,
  currency: string,
  date: Date,
  type: OrderType,
  timeToDeliverOrPickup: Date,
  notes: string,
  deleted?: boolean
}