export async function fetchWeatherData(year) {
  const response = await fetch(
    `http://localhost:3001/api/weather/${year}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  return response.json();
}
