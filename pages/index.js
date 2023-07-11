import Image from "next/image";
import { BsSearch } from "react-icons/bs";
import Head from "next/head";
import axios from "axios";
import { useState, useEffect } from "react";
import Weather from "../components/Weather";

export default function Home() {
	const [city, setCity] = useState("");
	const [weather, setWeather] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchWeather = async (e) => {
		e.preventDefault();
		if (!city) {
			setError("City name cannot be empty");
			return;
		}
		setLoading(true);
		try {
			const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const geocodingResponse = await axios.get(geocodingUrl);
			if (geocodingResponse.data.length === 0) {
				throw new Error("City not found");
			}
			const { lat, lon, country, state } = geocodingResponse.data[0];
			const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const weatherResponse = await axios.get(weatherUrl);
			setWeather({
				...weatherResponse.data,
				country,
				state,
			});
			setError(null);
			setCity(""); // Clear the search bar after the weather data has been set
		} catch (error) {
			setError(error.message);
		}
		setLoading(false);
	};

	const fetchRandomWeather = async () => {
		setLoading(true);
		try {
			// Define population range
			const min_population = 2697000;
			const max_population = 100000000;

			const cityUrl = `https://api.api-ninjas.com/v1/city?min_population=${min_population}&max_population=${max_population}&limit=30`;
			const cityResponse = await axios.get(cityUrl, {
				headers: { "X-Api-Key": process.env.NEXT_PUBLIC_API_NINJA_KEY },
			});
			const cities = cityResponse.data;

			// Select a random city from the list
			const randomCity = cities[Math.floor(Math.random() * cities.length)];

			const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${randomCity.name}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const geocodingResponse = await axios.get(geocodingUrl);
			const { lat, lon, country, state } = geocodingResponse.data[0];
			const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
			const weatherResponse = await axios.get(weatherUrl);
			setWeather({
				...weatherResponse.data,
				country,
				state,
			});
			setError(null);
			setCity(""); // Clear the search bar
		} catch (error) {
			setError(error.message);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchRandomWeather();
	}, []);

	return (
		<div>
			<Head>
				<title>Weather - Next App</title>
				<meta name="description" content="Generated by create next app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			{/* Search */}
			<div className="relative flex justify-between items-center max-w-[500px] w-full m-auto pt-4 px-4 text-white z-10">
				<form
					onSubmit={fetchWeather}
					className="flex justify-between items-center w-full m-auto p-3 bg-transparent border border-gray-300 text-white rounded-2xl"
				>
					<div>
						<input
							onChange={(e) => setCity(e.target.value)}
							className="bg-transparent border-none text-white focus:outline-none text-2xl"
							type="text"
							placeholder="Search city"
						/>
					</div>
					<button onClick={fetchWeather}>
						<BsSearch size={20} />
					</button>
					<button type="button" onClick={fetchRandomWeather}>
						Random City
					</button>
				</form>
				{loading && <div>Loading...</div>}
				{error && (
					<div className="mt-2 bg-red-500 text-white py-2 px-4 rounded-md">
						{error}
					</div>
				)}
			</div>

			{/* Overlay */}
			<div className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 z-[1]" />

			{/* Background image */}
			<Image
				src="https://images.unsplash.com/photo-1580193769210-b8d1c049a7d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80"
				alt="background img"
				layout="fill"
				className="object-cover"
			/>

			{/* Weather */}
			{Object.keys(weather).length !== 0 && <Weather data={weather} />}
		</div>
	);
}
