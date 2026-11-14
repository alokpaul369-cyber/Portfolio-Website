import { Code2 } from 'lucide-react';
import { DiJava } from 'react-icons/di';
import { TbApi } from 'react-icons/tb';
import { VscVscode } from 'react-icons/vsc';
import {
  SiBootstrap,
  SiC,
  SiCloudinary,
  SiCplusplus,
  SiCss,
  SiExpress,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiJsonwebtokens,
  SiMongodb,
  SiMongoose,
  SiNextdotjs,
  SiNodedotjs,
  SiNpm,
  SiPnpm,
  SiPostman,
  SiReact,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';

/**
 * Maps the `icon` value stored on a Skill to an icon component.
 *
 * Icons are imported by name so the bundle contains only these icons rather
 * than whole icon sets. To support a new skill icon, import it above and add
 * it here, then use its key in the admin form.
 */
const registry = {
  SiBootstrap,
  SiC,
  SiCloudinary,
  SiCplusplus,
  SiCss,
  SiExpress,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiJsonwebtokens,
  SiMongodb,
  SiMongoose,
  SiNextdotjs,
  SiNodedotjs,
  SiNpm,
  SiPnpm,
  SiPostman,
  SiReact,
  SiSqlite,
  SiTailwindcss,
  SiTypescript,
  DiJava,
  TbApi,
  VscVscode,
};

/** Icon keys available to the admin form. */
export const SKILL_ICON_KEYS = Object.keys(registry).sort();

/** Returns the icon component for a key, or a neutral code icon when unknown. */
export function getSkillIcon(key) {
  return registry[key] ?? Code2;
}
