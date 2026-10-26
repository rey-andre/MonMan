<template>
  <component :is="resolvedIcon" v-if="resolvedIcon" :size="size" :stroke-width="strokeWidth" :class="customClass" />
  <span v-else class="inline-block w-4 h-4 bg-gray-400 rounded-full"></span>
</template>

<script setup>
import { computed } from 'vue'
import {
  TrendingUp,
  Wallet,
  Landmark,
  Building2,
  Smartphone,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowLeft,
  Plus,
  PlusCircle,
  RefreshCw,
  Trash2,
  Edit3,
  X,
  ChevronRight,
  PieChart,
  Target,
  Home,
  History,
  Coins,
  Scale,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Gift,
  Check,
  CheckCircle,
  CheckCircle2,
  Circle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Search,
  Sparkles,
  Sun,
  SunMedium,
  Moon,
  MoonStar,
  LogIn,
  LogOut,
  User,
  UserPlus,
  UserCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  EyeClosed,
  CreditCard
} from 'lucide-vue-next'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 18
  },
  strokeWidth: {
    type: [Number, String],
    default: 2
  },
  customClass: {
    type: String,
    default: ''
  }
})

const iconMap = {
  TrendingUp,
  Wallet,
  Landmark,
  Building2,
  Smartphone,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowLeft,
  Plus,
  PlusCircle,
  RefreshCw,
  Trash2,
  Edit3,
  X,
  ChevronRight,
  PieChart,
  Target,
  Home,
  History,
  Coins,
  Scale,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Gamepad2,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Gift,
  Check,
  CheckCircle,
  CheckCircle2,
  Circle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Search,
  Sparkles,
  Sun,
  SunMedium,
  Moon,
  MoonStar,
  LogIn,
  LogOut,
  User,
  UserPlus,
  UserCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  EyeClosed,
  CreditCard
}

const resolvedIcon = computed(() => {
  return iconMap[props.name] || Coins
})
</script>
