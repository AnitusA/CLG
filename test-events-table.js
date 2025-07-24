import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testEventsTable() {
  try {
    console.log('🎪 Testing Events table...');
    
    // Test if events table exists by trying to fetch data
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .limit(1);

    if (eventsError) {
      console.log('❌ Events table does not exist or has an error:', eventsError.message);
      console.log('📝 Please run the events table SQL:');
      console.log('   File: create-events-table.sql');
      console.log('   OR copy the SQL from the setup instructions in the Events page');
      return;
    }

    console.log('✅ Events table exists and is accessible');
    console.log(`📊 Found ${events.length} existing events`);

    // Test inserting a sample event
    console.log('\n🔄 Testing event creation...');
    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert({
        event_name: 'Test Event - Connection Check',
        event_date: '2025-08-01',
        description: 'This is a test event to verify the database connection and functionality.',
        status: 'upcoming'
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Error creating test event:', insertError.message);
      return;
    }

    console.log('✅ Test event created successfully');
    console.log(`   Event ID: ${newEvent.id}`);
    console.log(`   Event Name: ${newEvent.event_name}`);

    // Test updating the event
    console.log('\n🔄 Testing event update...');
    const { error: updateError } = await supabase
      .from('events')
      .update({ status: 'completed' })
      .eq('id', newEvent.id);

    if (updateError) {
      console.log('❌ Error updating test event:', updateError.message);
    } else {
      console.log('✅ Test event updated successfully');
    }

    // Clean up test event
    console.log('\n🧹 Cleaning up test event...');
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', newEvent.id);

    if (deleteError) {
      console.log('❌ Error deleting test event:', deleteError.message);
    } else {
      console.log('✅ Test event deleted successfully');
    }

    console.log('\n🎉 Events functionality is working perfectly!');
    console.log('🔗 You can now use the Events section in your admin dashboard.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n📝 Manual setup required:');
    console.log('Please copy the SQL from "create-events-table.sql" and run it in Supabase SQL Editor.');
  }
}

testEventsTable();
