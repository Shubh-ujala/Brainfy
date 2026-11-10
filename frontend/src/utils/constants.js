import { Youtube, Twitter, Github, Linkedin, FileText, Globe } from 'lucide-react';

export const PLATFORM_CONFIG = {
  YouTube: {
    icon: Youtube,
    color: '#ff0000',
    bg: 'rgba(255,0,0,0.12)',
    label: 'YouTube',
  },
  'Twitter/X': {
    icon: Twitter,
    color: '#1d9bf0',
    bg: 'rgba(29,155,240,0.12)',
    label: 'Twitter/X',
  },
  GitHub: {
    icon: Github,
    color: '#e6edf3',
    bg: 'rgba(230,237,243,0.1)',
    label: 'GitHub',
  },
  LinkedIn: {
    icon: Linkedin,
    color: '#0a66c2',
    bg: 'rgba(10,102,194,0.12)',
    label: 'LinkedIn',
  },
  Medium: {
    icon: FileText,
    color: '#00ab6c',
    bg: 'rgba(0,171,108,0.12)',
    label: 'Medium',
  },
  Website: {
    icon: Globe,
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.1)',
    label: 'Website',
  },
};

export const SORT_OPTIONS = [
  { value: 'newest',       label: 'Newest First' },
  { value: 'oldest',       label: 'Oldest First' },
  { value: 'alphabetical', label: 'A – Z' },
];

export const PLATFORM_OPTIONS = [
  { value: '', label: 'All Platforms' },
  ...Object.keys(PLATFORM_CONFIG).map((k) => ({ value: k, label: PLATFORM_CONFIG[k].label })),
];

export const COLLECTION_COLORS = [
  '#5B5BF0', '#14B8A6', '#16A34A', '#F59E0B',
  '#E5484D', '#A855F7', '#EC4899', '#06B6D4',
];

