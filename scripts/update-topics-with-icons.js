import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const topicIcons = {
  'Database Fundamentals': 'Database',
  'Entity-Relationship Modeling': 'Table',
  'Normalization': 'Key',
  'Indexing and Query Optimization': 'GitBranch',
  'Database Security': 'Shield',
  'Transaction Management': 'Zap',
  'Backup and Recovery': 'Cloud',
  'Non-Functional Requirements': 'BarChart3'
};

async function updateTopicsWithIcons() {
  try {
    // First, add the icon column if it doesn't exist
    console.log('Adding icon column to topics table...');
    
    // Get all topics
    const { data: topics, error: fetchError } = await supabase
      .from('topics')
      .select('id, title');
    
    if (fetchError) {
      console.error('Error fetching topics:', fetchError);
      return;
    }
    
    console.log(`Found ${topics.length} topics to update`);
    
    // Update each topic with its icon
    for (const topic of topics) {
      const icon = topicIcons[topic.title];
      if (icon) {
        console.log(`Updating topic "${topic.title}" with icon "${icon}"`);
        
        const { error: updateError } = await supabase
          .from('topics')
          .update({ icon })
          .eq('id', topic.id);
        
        if (updateError) {
          console.error(`Error updating topic "${topic.title}":`, updateError);
        } else {
          console.log(`✓ Updated topic "${topic.title}"`);
        }
      } else {
        console.log(`⚠ No icon found for topic "${topic.title}"`);
      }
    }
    
    console.log('Topic icons update completed!');
  } catch (error) {
    console.error('Error updating topics:', error);
  }
}

updateTopicsWithIcons();