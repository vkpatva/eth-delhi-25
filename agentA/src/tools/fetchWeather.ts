import { tool } from "@langchain/core/tools";
import fetch from "node-fetch";

// A simple weather tool using Open-Meteo
import { z } from "zod";

export const weatherTool = tool(
  async ({ city }: { city: string }) => {
    const geocodeRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}`
    );
    const geoData = await geocodeRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return `Could not find coordinates for city: ${city}`;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    if (!weatherData.current_weather) {
      return `Could not fetch weather for ${name}, ${country}`;
    }

    const { temperature, windspeed, weathercode } = weatherData.current_weather;

    return `Current weather in ${name}, ${country}: ${temperature}°C, wind ${windspeed} km/h (code ${weathercode}).`;
  },
  {
    name: "get_weather",
    description:
      "Get current weather for a given city (e.g., 'Paris', 'Tokyo')",
    schema: z.object({
      city: z
        .string()
        .describe("The city to get weather for, e.g. Paris, Tokyo"),
    }),
  }
);
