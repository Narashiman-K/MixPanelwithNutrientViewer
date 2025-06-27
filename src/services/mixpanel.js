// src/services/mixpanel.js - Enhanced with debugging
import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN || 'your-mixpanel-token-here';

class MixpanelService {
  constructor() {
    this.isInitialized = false;
    this.eventQueue = []; // Store events for debugging
    this.init();
  }

  init() {
    try {
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: true, // Always enable debug to see console logs
        track_pageview: true,
        persistence: 'localStorage',
        api_host: 'https://api.mixpanel.com', // Ensure correct endpoint
      });
      this.isInitialized = true;
      
      // Show success message
      console.log('✅ Mixpanel initialized successfully');
      console.log('🔍 Project Token:', MIXPANEL_TOKEN.substring(0, 8) + '...');
      
      // Test event to verify connection
      this.track('Mixpanel Initialized', { test: true });
      
    } catch (error) {
      console.error('❌ Failed to initialize Mixpanel:', error);
    }
  }

  // Enhanced track method with debugging
  track(eventName, properties = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️ Mixpanel not initialized, queuing event:', eventName);
      return;
    }
    
    try {
      const eventData = {
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
        }
      };

      // Log to console for debugging
      console.log('📊 Tracking Event:', eventName, eventData.properties);
      
      // Store in queue for debugging
      this.eventQueue.push({
        timestamp: new Date(),
        event: eventName,
        properties: eventData.properties
      });

      // Send to Mixpanel
      mixpanel.track(eventName, eventData.properties);
      
      // Show success in console
      console.log('✅ Event sent to Mixpanel successfully');
      
    } catch (error) {
      console.error('❌ Mixpanel tracking error:', error);
    }
  }

  // Method to see all tracked events (for debugging)
  getTrackedEvents() {
    return this.eventQueue;
  }

  // Method to clear event queue
  clearEventQueue() {
    this.eventQueue = [];
  }

  // Rest of your methods remain the same...
  identify(userId, properties = {}) {
    if (!this.isInitialized) return;
    
    try {
      console.log('👤 Identifying user:', userId, properties);
      mixpanel.identify(userId);
      mixpanel.people.set(properties);
    } catch (error) {
      console.error('❌ Mixpanel identify error:', error);
    }
  }

  trackPageView(pageName, properties = {}) {
    this.track('Page View', {
      page_name: pageName,
      ...properties,
    });
  }

  trackPDFLoaded(fileName, fileSize) {
    this.track('PDF Loaded', {
      file_name: fileName,
      file_size: fileSize,
      load_time: Date.now(),
    });
  }

  trackPDFAction(action, details = {}) {
    this.track('PDF Action', {
      action_type: action,
      ...details,
    });
  }

  trackUserEngagement(engagementType, duration, details = {}) {
    this.track('User Engagement', {
      engagement_type: engagementType,
      duration_seconds: duration,
      ...details,
    });
  }
}

// Export singleton instance
const mixpanelService = new MixpanelService();

// Make it available in browser console for debugging
if (typeof window !== 'undefined') {
  window.mixpanelDebug = {
    service: mixpanelService,
    getEvents: () => mixpanelService.getTrackedEvents(),
    clearEvents: () => mixpanelService.clearEventQueue(),
    testEvent: () => mixpanelService.track('Test Event', { test: true, timestamp: Date.now() })
  };
}

export default mixpanelService;