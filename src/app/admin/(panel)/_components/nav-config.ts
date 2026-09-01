import {
  Camera,
  FolderTree,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  Mail,
  Package,
  Settings,
  Users,
} from "lucide-react";

export const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/hero", label: "Hero slides", icon: Camera },
  { href: "/admin/lookbook", label: "Lookbook", icon: Images },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/users", label: "Accounts", icon: Users, adminOnly: true },
] as const;
