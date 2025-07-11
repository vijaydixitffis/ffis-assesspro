import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Default fallback icon
const DefaultIcon = LucideIcons.HelpCircle;

/**
 * Dynamically get a Lucide React icon by name
 * @param iconName - The name of the Lucide React icon (e.g., 'Database', 'Shield', 'Cloud')
 * @returns The icon component or a default icon if not found
 */
export function getLucideIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) {
    return DefaultIcon;
  }

  // Get the icon from the Lucide icons collection
  const IconComponent = (LucideIcons as any)[iconName] as LucideIcon;
  
  // Return the icon if it exists, otherwise return the default
  return IconComponent || DefaultIcon;
}

/**
 * Get icon with fallback logic for backward compatibility
 * @param iconName - The stored icon name
 * @param topicTitle - The topic title for fallback logic
 * @returns The appropriate icon component
 */
export function getTopicIcon(iconName: string | null | undefined, topicTitle?: string): LucideIcon {
  // If we have a stored icon name, use it
  if (iconName) {
    return getLucideIcon(iconName);
  }

  // Fallback to legacy logic based on topic title
  if (topicTitle) {
    return getLegacyTopicIcon(topicTitle);
  }

  return DefaultIcon;
}

/**
 * Legacy icon mapping for backward compatibility
 */
function getLegacyTopicIcon(topicTitle: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    // Database-related topics
    'Database Fundamentals': LucideIcons.Database,
    'Entity-Relationship Modeling': LucideIcons.Table2,
    'Normalization': LucideIcons.Key,
    'Indexing and Query Optimization': LucideIcons.GitBranch,
    'Database Security': LucideIcons.Shield,
    'Transaction Management': LucideIcons.Zap,
    'Backup and Recovery': LucideIcons.Cloud,
    'Non-Functional Requirements': LucideIcons.BarChart3,
    
    // IT Portfolio and Architecture topics
    'IT Portfolio Overview': LucideIcons.Building,
    'Strategic Alignment': LucideIcons.Target,
    'Technology Assessment': LucideIcons.Cpu,
    'Risk Management': LucideIcons.Shield,
    'Governance Framework': LucideIcons.Settings,
    'Performance Metrics': LucideIcons.TrendingUp,
    'Cost Management': LucideIcons.BarChart3,
    'Compliance Standards': LucideIcons.FileText,
    
    // Application Architecture topics
    'Application Design': LucideIcons.Code,
    'System Architecture': LucideIcons.Layers,
    'Integration Patterns': LucideIcons.Network,
    'Scalability Planning': LucideIcons.Server,
    'Security Architecture': LucideIcons.Lock,
    'Performance Optimization': LucideIcons.Zap,
    'Data Management': LucideIcons.Database,
    'User Experience Design': LucideIcons.Users,
    
    // DevOps Assessment topics
    'CI/CD Pipeline': LucideIcons.GitBranch,
    'Infrastructure as Code': LucideIcons.Code,
    'Monitoring and Logging': LucideIcons.MonitorSpeaker,
    'Security Practices': LucideIcons.Shield,
    'Container Management': LucideIcons.Server,
    'Automation Strategy': LucideIcons.Workflow,
    'Team Collaboration': LucideIcons.Users,
    'Release Management': LucideIcons.Target,
    
    // General IT topics
    'Business Requirements': LucideIcons.Briefcase,
    'Technical Standards': LucideIcons.Settings,
    'Project Management': LucideIcons.Target,
    'Quality Assurance': LucideIcons.CheckCircle2,
    'Documentation': LucideIcons.FileText,
    'Training and Support': LucideIcons.Users,
    'Vendor Management': LucideIcons.Building,
    'Innovation Strategy': LucideIcons.TrendingUp
  };
  
  // For exact matches
  if (iconMap[topicTitle]) {
    return iconMap[topicTitle];
  }
  
  // For partial matches (case-insensitive)
  const lowerTitle = topicTitle.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerTitle.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTitle)) {
      return icon;
    }
  }
  
  // Default fallback based on keywords
  if (lowerTitle.includes('database') || lowerTitle.includes('data')) return LucideIcons.Database;
  if (lowerTitle.includes('security') || lowerTitle.includes('secure')) return LucideIcons.Shield;
  if (lowerTitle.includes('cloud') || lowerTitle.includes('infrastructure')) return LucideIcons.Cloud;
  if (lowerTitle.includes('architecture') || lowerTitle.includes('design')) return LucideIcons.Layers;
  if (lowerTitle.includes('application') || lowerTitle.includes('app')) return LucideIcons.Code;
  if (lowerTitle.includes('performance') || lowerTitle.includes('optimize')) return LucideIcons.Zap;
  if (lowerTitle.includes('management') || lowerTitle.includes('governance')) return LucideIcons.Settings;
  if (lowerTitle.includes('user') || lowerTitle.includes('team')) return LucideIcons.Users;
  if (lowerTitle.includes('server') || lowerTitle.includes('compute')) return LucideIcons.Server;
  if (lowerTitle.includes('network') || lowerTitle.includes('integration')) return LucideIcons.Network;
  
  return DefaultIcon;
}