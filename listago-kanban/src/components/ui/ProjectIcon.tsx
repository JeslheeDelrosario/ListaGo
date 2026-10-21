import {
  FiAward,
  FiBook,
  FiBriefcase,
  FiCalendar,
  FiCamera,
  FiCode,
  FiCoffee,
  FiFolder,
  FiGlobe,
  FiHeart,
  FiHome,
  FiInbox,
  FiMusic,
  FiShoppingBag,
  FiStar,
  FiTarget,
  FiUsers,
  FiZap,
  FiFlag,
} from "react-icons/fi";
import type { IconType } from "react-icons";

import { PROJECT_ICON_NAMES, type ProjectIconName } from "@/types";

/** One selectable project icon: stored name, picker label and component. */
export interface ProjectIconChoice {
  /** Value stored in `Project.icon`. */
  name: ProjectIconName;
  /** Accessible label shown in the picker. */
  label: string;
  /** react-icons/fi component rendering the icon. */
  Icon: IconType;
}

/** Every icon offered by the project modal's icon picker. */
export const PROJECT_ICON_CHOICES: readonly ProjectIconChoice[] = [
  { name: "FiInbox", label: "Inbox", Icon: FiInbox },
  { name: "FiFolder", label: "Folder", Icon: FiFolder },
  { name: "FiBriefcase", label: "Briefcase", Icon: FiBriefcase },
  { name: "FiBook", label: "Book", Icon: FiBook },
  { name: "FiCode", label: "Code", Icon: FiCode },
  { name: "FiHeart", label: "Heart", Icon: FiHeart },
  { name: "FiStar", label: "Star", Icon: FiStar },
  { name: "FiHome", label: "Home", Icon: FiHome },
  { name: "FiGlobe", label: "Globe", Icon: FiGlobe },
  { name: "FiMusic", label: "Music", Icon: FiMusic },
  { name: "FiCamera", label: "Camera", Icon: FiCamera },
  { name: "FiCoffee", label: "Coffee", Icon: FiCoffee },
  { name: "FiZap", label: "Zap", Icon: FiZap },
  { name: "FiTarget", label: "Target", Icon: FiTarget },
  { name: "FiFlag", label: "Flag", Icon: FiFlag },
  { name: "FiAward", label: "Award", Icon: FiAward },
  { name: "FiShoppingBag", label: "Shopping", Icon: FiShoppingBag },
  { name: "FiCalendar", label: "Calendar", Icon: FiCalendar },
  { name: "FiUsers", label: "Users", Icon: FiUsers },
];

const ICON_BY_NAME: Record<string, IconType> = Object.fromEntries(
  PROJECT_ICON_CHOICES.map((choice) => [choice.name, choice.Icon]),
);

/**
 * Maps Phase 1 Font Awesome classes and Phase 2 lucide short names onto
 * the matching Feather icon, so existing localStorage data still renders
 * the icon the user originally picked.
 */
const LEGACY_ICON_ALIASES: Record<string, IconType> = {
  "fas fa-inbox": FiInbox,
  "fas fa-folder": FiFolder,
  "fas fa-folder-open": FiFolder,
  "fas fa-briefcase": FiBriefcase,
  "fas fa-rocket": FiZap,
  "fas fa-code": FiCode,
  "fas fa-heart": FiHeart,
  "fas fa-home": FiHome,
  inbox: FiInbox,
  folder: FiFolder,
  briefcase: FiBriefcase,
  rocket: FiZap,
  code: FiCode,
  heart: FiHeart,
};

/** Legacy strings mapped onto their canonical Feather picker name. */
const LEGACY_ICON_NAME_ALIASES: Record<string, ProjectIconName> = {
  "fas fa-inbox": "FiInbox",
  "fas fa-folder": "FiFolder",
  "fas fa-folder-open": "FiFolder",
  "fas fa-briefcase": "FiBriefcase",
  "fas fa-rocket": "FiZap",
  "fas fa-code": "FiCode",
  "fas fa-heart": "FiHeart",
  "fas fa-home": "FiHome",
  inbox: "FiInbox",
  folder: "FiFolder",
  briefcase: "FiBriefcase",
  rocket: "FiZap",
  code: "FiCode",
  heart: "FiHeart",
  home: "FiHome",
};

/**
 * Maps any stored icon string (Phase 3 Feather name, Phase 2 lucide name
 * or Phase 1 Font Awesome class) onto a canonical name the icon picker
 * recognizes, so editing an older project highlights the right choice.
 */
export function normalizeProjectIconName(icon: string): ProjectIconName {
  if ((PROJECT_ICON_NAMES as readonly string[]).includes(icon)) {
    return icon as ProjectIconName;
  }
  return LEGACY_ICON_NAME_ALIASES[icon] ?? "FiFolder";
}

interface ProjectIconProps {
  /** The stored `Project.icon` string (Feather name or a legacy name). */
  iconName: string;
  /** The project color applied as the icon's stroke color. */
  color: string;
  /** Icon size in pixels (default 18). */
  size?: number;
}

/**
 * Renders a project's icon as a Feather (react-icons/fi) icon stroked in
 * the project's color. Understands Phase 3 Feather names, Phase 2 lucide
 * names and Phase 1 Font Awesome classes; anything unknown falls back to
 * a folder icon.
 */
export function ProjectIcon({ iconName, color, size = 18 }: ProjectIconProps) {
  const Icon = ICON_BY_NAME[iconName] ?? LEGACY_ICON_ALIASES[iconName] ?? FiFolder;
  return <Icon size={size} color={color} aria-hidden />;
}
