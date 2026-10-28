import {
  type IconComponent,
  ActivityIcon,
  BellIcon,
  BriefcaseIcon,
  ChartPieIcon,
  ClipboardIcon,
  CopyIcon,
  FileTextIcon,
  FolderIcon,
  HouseIcon,
  LayoutGridIcon,
  MessageSquareIcon,
  PackageIcon,
  PercentIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  SlidersVerticalIcon,
  SquareCheckBigIcon,
  TagIcon,
  TruckIcon,
  UserPlusIcon,
  UsersIcon,
} from "../../../shared/components/icon";

/**
 * Icon names stored in the Pages / Modules tables -> the icon component. The stored names are the Feather names the menu
 * started with (FiTruck, ...); they keep working although the icons are now Lucide. A new menu icon: add it to
 * shared/components/icon/icons.ts, then a line here under the name the database will store.
 */
const icons: Record<string, IconComponent> = {
  FiActivity: ActivityIcon,
  FiBell: BellIcon,
  FiBriefcase: BriefcaseIcon,
  FiCheckSquare: SquareCheckBigIcon,
  FiClipboard: ClipboardIcon,
  FiCopy: CopyIcon,
  FiFileText: FileTextIcon,
  FiFolder: FolderIcon,
  FiGrid: LayoutGridIcon,
  FiHome: HouseIcon,
  FiMessageSquare: MessageSquareIcon,
  FiPackage: PackageIcon,
  FiPercent: PercentIcon,
  FiPieChart: ChartPieIcon,
  FiSend: SendIcon,
  FiSettings: SettingsIcon,
  FiShield: ShieldIcon,
  FiSliders: SlidersVerticalIcon,
  FiTag: TagIcon,
  FiTruck: TruckIcon,
  FiUserPlus: UserPlusIcon,
  FiUsers: UsersIcon,
};

export const iconFor = (name: string | null | undefined): IconComponent => (name && icons[name]) || FolderIcon;
