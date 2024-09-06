import { json, type MetaFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import axios from "axios";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
// Helper function to create a GIF from base64 images
import GIFEncoder from 'gifencoder';
import { createCanvas, loadImage } from 'canvas';
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

export async function action({ request }: LoaderFunctionArgs) {
  console.log("Requesting GIF generation...");
  
  // Get the form data from the request
  const formData = await request.formData();
  const prompt = formData.get("prompt");

  if (!prompt) {
    return json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    // Make a request to the FastAPI backend
    const response = await axios.post(
      "http://3.250.146.47:8000/generate-gif",
      { prompt },
      {
        headers: { "Authorization": process.env.API_KEY }, // Add Authorization header
        timeout: 1000*20,
      }
    );

    // Check if the response contains base64 images
    const image_base64 = [response.data.data];

    // Assuming image_base64 contains two images for the GIF creation
    const gifBuffer = await createGIF(image_base64);

    // Return the base64 encoded GIF to the client
    const base64GIF = gifBuffer.toString("base64");
    return json({ base64GIF });
  } catch (error) {
    console.error("Error generating GIF:", error);

    // Return a fallback response in case of an error
    return json(
      {
        error: "Failed to generate GIF. Please try again.",
        gifUrl: "https://media.giphy.com/media/J5qSEmqUmgdQjvnCS4/giphy.gif", // Fallback GIF URL
      },
      { status: 500 }
    );
  }
}



// Helper function to create GIF from base64 PNGs
async function createGIF(imagesBase64: string[]): Promise<Buffer> {
  const encoder = new GIFEncoder(500, 500); // Specify the width and height of your GIF
  const canvas = createCanvas(500, 500);
  const ctx = canvas.getContext('2d');
  
  // Start encoding GIF
  encoder.start();
  encoder.setRepeat(0); // 0 for infinite loop
  encoder.setDelay(500); // 500ms between frames
  encoder.setQuality(10); // Image quality

  for (const imageBase64 of imagesBase64) {
    const image = await loadImage(`data:image/png;base64,${imageBase64}`);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing
    ctx.drawImage(image, 0, 0, 500, 500); // Draw image on canvas
    encoder.addFrame(ctx); // Add canvas frame to GIF
  }

  // Finish encoding the GIF
  encoder.finish();

  // Return the GIF as a buffer
  return encoder.out.getData();
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
        const byteCharacters = atob(actionData.base64GIF);
        const byteNumbers = new Array(byteCharacters.length)
          .fill(0)
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const gifBlob = new Blob([byteArray], { type: 'image/gif' });
  
        const gifObjectURL = URL.createObjectURL(gifBlob);
        setGifUrl(gifObjectURL);
      } else if (actionData.gifUrl) {
        setGifUrl(actionData.gifUrl); // Use fallback URL if provided
      }
    } else if (loader) {
      setGifUrl(loader.gifUrl); // Handle any loader-based fallback
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