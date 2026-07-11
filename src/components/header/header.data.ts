import {
  FiShoppingBag,
  FiCreditCard,
  FiMessageSquare,
  FiAlertTriangle,
  FiUserPlus,
  FiTruck,
} from "react-icons/fi";
import type { IconType } from "react-icons";

export interface NotificationItem {
  id: string;
  icon: IconType;
  title: string;
  time: string;
  read: boolean;
}

// TODO: replace with real notifications once the API is wired up.
export const notifications: NotificationItem[] = [
  {
    id: "order-10234",
    icon: FiShoppingBag,
    title: "Order #10234 placed by John Carter",
    time: "2m ago",
    read: false,
  },
  {
    id: "payment-10234",
    icon: FiCreditCard,
    title: "Payment of $249.00 confirmed",
    time: "15m ago",
    read: false,
  },
  {
    id: "message-sarah",
    icon: FiMessageSquare,
    title: "Sarah sent you a message",
    time: "1h ago",
    read: false,
  },
  {
    id: "stock-mouse",
    icon: FiAlertTriangle,
    title: "\"Wireless Mouse\" is low on stock",
    time: "3h ago",
    read: true,
  },
  {
    id: "signup-james",
    icon: FiUserPlus,
    title: "James Carter created an account",
    time: "5h ago",
    read: true,
  },
  {
    id: "shipped-10229",
    icon: FiTruck,
    title: "Order #10229 has been shipped",
    time: "1d ago",
    read: true,
  },
];
