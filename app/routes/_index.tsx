import { json, type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import axios from "axios";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Buffer } from 'buffer';

export const meta: MetaFunction = () => {
  return [
    { title: "Imagenator" },
    { name: "description", content: "Imagenator" },
  ];
};

export interface IActionData {
  gifUrl: string;
  error?: string;
  status?: number;
  base64GIF?: string;
}

export async function loader() {
  return json({ gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTFtaDZvajA2cjVtajYxbHNob3F2OWh1bjlvcWtybDNkdThoMHRvaSZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/sTczweWUTxLqg/giphy.gif" }, { status: 200 });
}

// Action function to handle the GIF generation request
export async function action({ request }: LoaderFunctionArgs) {
  console.log("Requesting GIF generation...");
  const formData = await request.formData();
  const prompt = formData.get("prompt");

  if (!prompt) {
    return json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const response = await axios.post(
      "http://34.118.97.20:8000/generate-gif",
      { prompt },
      { responseType: "arraybuffer", headers: { "Authorization": process.env.API_KEY }, timeout: 10000 }
    );

    const base64GIF = Buffer.from(response.data, "binary").toString("base64");

    // Return the base64 encoded GIF to the client
    return json({ base64GIF });
  } catch (error) {
    console.error("Error generating GIF:", error);
    return json({ error: "Failed to generate GIF. Please try again.", gifUrl: "https://media.giphy.com/media/J5qSEmqUmgdQjvnCS4/giphy.gif" }, { status: 500 });
  }
}



export default function Index() {
  const loader = useLoaderData<IActionData>();
  const actionData = useActionData<IActionData>();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  useEffect(() => {
    if (actionData) {
      setLoading(false);
      setError(actionData.error || null);
      if (actionData.base64GIF) {
        const gifBlob = new Blob([Buffer.from(actionData.base64GIF, 'base64')], { type: 'image/gif' });
        const gifObjectURL = URL.createObjectURL(gifBlob);
        setGifUrl(gifObjectURL);
      } else {
        setGifUrl(actionData.gifUrl);
      }
    } else if (loader) {
      setGifUrl(loader.gifUrl);
    }
  }, [actionData, loader]);

  const handleSubmit = () => {
    setLoading(true);
  };

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center">
      {gifUrl && (
        <img
          src={gifUrl}
          alt="Generated GIF"
          className="max-w-full max-h-full"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 bg-opacity-95 flex items-center justify-center gap-4">
        <Form method="post" className="flex gap-4 w-full max-w-lg" onSubmit={handleSubmit}>
          <input
            type="text"
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="flex-grow p-2 rounded border border-gray-300 bg-white text-black"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? "Generating..." : "Generate"}
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l-2.905 1.707A9.961 9.961 0 014 12H0c0 3.314 1.343 6.314 3.515 8.485l2.485-1.194z"
                />
              </svg>
            )}
          </button>
        </Form>
      </div>
    </div>
  );
}

/*

return (
    <div className="fixed inset-0 bg-black flex justify-center items-center">
      {loading && <p className="text-white">Loading...</p>}
      {gifUrl && (
        <img
          src={gifUrl}
          alt="Generated GIF"
          className="h-full w-full object-cover"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 bg-opacity-95 flex items-center justify-center gap-4">
        <Form method="post" className="flex gap-4 w-full max-w-lg">
          <input
            type="text"
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="flex-grow p-2 rounded border border-gray-300 bg-white text-black"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </Form>
      </div>
    </div>
  );
  */