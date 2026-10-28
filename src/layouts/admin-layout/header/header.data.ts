import {
  type IconComponent,
  CreditCardIcon,
  MessageSquareIcon,
  ShoppingBagIcon,
  TriangleAlertIcon,
  TruckIcon,
  UserPlusIcon,
} from "../../../shared/components/icon";

export interface NotificationItem {
  id: string;
  icon: IconComponent;
  title: string;
  time: string;
  read: boolean;
}

// TODO: replace with real notifications once the API is wired up.
export const notifications: NotificationItem[] = [
  {
    id: "order-10234",
    icon: ShoppingBagIcon,
    title: "Order #10234 placed by John Carter",
    time: "2m ago",
    read: false,
  },
  {
    id: "payment-10234",
    icon: CreditCardIcon,
    title: "Payment of $249.00 confirmed",
    time: "15m ago",
    read: false,
  },
  {
    id: "message-sarah",
    icon: MessageSquareIcon,
    title: "Sarah sent you a message",
    time: "1h ago",
    read: false,
  },
  {
    id: "stock-mouse",
    icon: TriangleAlertIcon,
    title: "\"Wireless Mouse\" is low on stock",
    time: "3h ago",
    read: true,
  },
  {
    id: "signup-james",
    icon: UserPlusIcon,
    title: "James Carter created an account",
    time: "5h ago",
    read: true,
  },
  {
    id: "shipped-10229",
    icon: TruckIcon,
    title: "Order #10229 has been shipped",
    time: "1d ago",
    read: true,
  },
];
