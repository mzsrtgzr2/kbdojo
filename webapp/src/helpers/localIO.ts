import { Order, OrderType } from "types/entities";
import moment from 'moment'
import copy from "copy-to-clipboard";


export const copyOrder = (order: Order): void => {
    let text = `Order Information
=================
Name: ${order.userName}
Phone: ${order.userPhone}
Status: ${order.status}`;
    switch (order.type) {
        case OrderType.pickup:
            text += `
Type: Pickup
`
            break;
        case OrderType.shipment:
            text += `
Type: Delivery
Address: ${order.userAddress}
`
            break;
    }
    text += `
Price: ${order.price} ${order.currency}
Created At: ${moment(order.date).format()}`

    // products
    text += `
Products:`

    for (const product of order.products) {
        text += `
- ${product.name} ${!!product.quantity ? (' x ' + product.quantity) : (product.weight + ' ' + product.measure)}`
    }

    copy(text);
}