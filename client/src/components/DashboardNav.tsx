
import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  ClipboardList,
  BarChart2,
  CircleUser,
  HelpCircle,
  Home,
  LogOut,
  Users,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sidebar navigation removed. Navigation is now handled in the top bar (Header.tsx).
export function DashboardNav() {
  return null;
}
