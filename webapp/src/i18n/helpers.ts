import { OrderStatus, OrderType, PaymentOptions } from 'types/entities';


export function getOrderStatusI18NKey(
    status: OrderStatus, type: OrderType
) {
    switch (status) {
        case OrderStatus.pending:
            return 'ORDER_STATUS.PENDING';
        case OrderStatus.inProgress:
            return 'ORDER_STATUS.IN_PROGRESS';
        case OrderStatus.inTransit:
            return 'ORDER_STATUS.IN_TRANSIT';
        case OrderStatus.readyToBePicked:
            return 'ORDER_STATUS.READY_TO_BE_PICKED';
        case OrderStatus.done:
            switch (type) {
                case OrderType.pickup:
                    return 'ORDER_STATUS.PICKED_UP';
                case OrderType.shipment:
                    return 'ORDER_STATUS.ACCEPTED';
            }
    }
}

export function getPaymentOptionI18NKey(
    paymentOption: PaymentOptions
) {
    switch (paymentOption) {
        case PaymentOptions.cash:
            return 'ORDER.PAYMENT_METHOD.CASH';
        case PaymentOptions.creditcard:
            return 'ORDER.PAYMENT_METHOD.CREDITCARD'
    }
}