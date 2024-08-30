import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useState } from "react";
import axios from "axios";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get("prompt");

  if (!prompt) {
    return json({ gifUrl: null });
  }

  try {
    const response = await axios.post(
      "http://34.116.177.189:8000/generate-gif",
      { prompt },
      { responseType: "blob", headers: { "Authorization": "e1fd2598-aa3e-4376-8c44-b35b8eb83172" } },
    );

    const gifUrl = URL.createObjectURL(response.data);
    return json({ gifUrl });
  } catch (error) {
    console.error("Error generating GIF:", error);
    return json({ gifUrl: "https://media.giphy.com/media/J5qSEmqUmgdQjvnCS4/giphy.gif" }); // Fallback GIF
  }
};



export default function Index() {
  const data = useLoaderData();
  const [prompt, setPrompt] = useState("");
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateGif = async () => {
    console.log("Generating GIF...");
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await axios.post(
        "http://34.116.177.189:8000/generate-gif",
        { prompt },
        { responseType: "blob" }
      );
      console.log("API response:", response);

      const url = URL.createObjectURL(response.data);
      setGifUrl(url);
      console.log("GIF URL set:", url);
    } catch (error) {
      console.error("Error generating GIF:", error);
      setError("Failed to generate GIF. Please try again.");
      setGifUrl("https://media.giphy.com/media/J5qSEmqUmgdQjvnCS4/giphy.gif"); // Fallback GIF
    } finally {
      setLoading(false);
    }
  };

  console.log("Render - loading:", loading, "gifUrl:", gifUrl);

  return (
    <div className="relative w-full h-full bg-black flex justify-center items-center">
      {loading && <p className="text-white">Loading...</p>}
      {!loading && error && <p className="text-red-500">{error}</p>}
      {gifUrl && !loading && (
        <img src={gifUrl} alt="Generated GIF" className="max-w-full max-h-full object-contain" />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white bg-opacity-90 flex items-center justify-center gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="flex-grow p-2 rounded border border-gray-300"
        />
        <button
          onClick={handleGenerateGif}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
    </div>
  );
}