import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import getMongoClient from "@/lib/mongodb";

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

const DATA_DIR = path.join(process.cwd(), "data");
const LOCATIONS_FILE = path.join(DATA_DIR, "locations.json");

// File system methods (for local development or platforms with persistent storage)
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readLocationsFromFile(): Promise<LocationData[]> {
  try {
    if (!existsSync(LOCATIONS_FILE)) {
      return [];
    }
    const fileContent = await readFile(LOCATIONS_FILE, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading locations from file:", error);
    return [];
  }
}

async function writeLocationsToFile(locations: LocationData[]): Promise<void> {
  await ensureDataDir();
  await writeFile(LOCATIONS_FILE, JSON.stringify(locations, null, 2), "utf-8");
}

// MongoDB methods (for production deployment)
async function saveLocationToMongoDB(
  locationData: LocationData
): Promise<void> {
  try {
    const client = await getMongoClient();
    const db = client.db("location-app");
    const collection = db.collection("locations");
    await collection.insertOne(locationData);
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    throw error;
  }
}

async function getLocationsFromMongoDB(): Promise<LocationData[]> {
  try {
    const client = await getMongoClient();
    const db = client.db("location-app");
    const collection = db.collection<LocationData>("locations");
    const locations = await collection
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    // Remove MongoDB _id field and return only LocationData
    return locations.map(({ _id, ...location }) => location);
  } catch (error) {
    console.error("Error reading from MongoDB:", error);
    return [];
  }
}

// Check if MongoDB is configured
function useMongoDB(): boolean {
  return !!process.env.MONGODB_URI;
}

// Extract device info from request headers (as backup)
function getDeviceInfoFromHeaders(request: NextRequest): Partial<DeviceInfo> {
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const acceptLanguage = request.headers.get("accept-language") || "Unknown";
  
  return {
    userAgent,
    language: acceptLanguage.split(",")[0] || "Unknown",
  };
}

export async function POST(request: NextRequest) {
  try {
    const locationData: LocationData = await request.json();

    // Validate location data
    if (
      typeof locationData.latitude !== "number" ||
      typeof locationData.longitude !== "number" ||
      !locationData.timestamp ||
      isNaN(locationData.latitude) ||
      isNaN(locationData.longitude) ||
      !locationData.deviceInfo
    ) {
      return NextResponse.json(
        { error: "Invalid location data" },
        { status: 400 }
      );
    }

    // Merge server-side device info with client-side (server info as backup)
    const serverDeviceInfo = getDeviceInfoFromHeaders(request);
    locationData.deviceInfo = {
      ...locationData.deviceInfo,
      ...serverDeviceInfo,
    };

    // Use MongoDB if configured, otherwise use file system
    if (useMongoDB()) {
      await saveLocationToMongoDB(locationData);
    } else {
      const locations = await readLocationsFromFile();
      locations.push(locationData);
      await writeLocationsToFile(locations);
    }

    return NextResponse.json(
      { success: true, message: "Location saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving location:", error);
    return NextResponse.json(
      { error: "Failed to save location" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let locations: LocationData[];

    if (useMongoDB()) {
      locations = await getLocationsFromMongoDB();
    } else {
      locations = await readLocationsFromFile();
    }

    return NextResponse.json({ locations }, { status: 200 });
  } catch (error) {
    console.error("Error reading locations:", error);
    return NextResponse.json(
      { error: "Failed to read locations" },
      { status: 500 }
    );
  }
}
