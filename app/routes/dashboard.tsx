import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "../services/auth.server";
import { IUser } from "../model/user";
import { sessionStorage } from "../services/session.server";
import { useState } from "react";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: '' });

type ActionData =
    | { response: string } | undefined;

async function openaiCall(base64Image: string): Promise<string | null> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 500,
        temperature: 0.5,
        messages: [
            {
                role: "system",
                content: "You are receiving an image. It contains marketing campaign and your task is to detect tthe slogan and suggest 4 similar and 4 different slogans. Your answer has to only include slogans, nothing else. Think step by step.",
            },
            {
                role: "user",
                content: [
                    { type: "text", text: "Complete the task!" },
                    {
                        type: "image_url",
                        image_url: {
                            "url": "data:image/jpeg;base64," + base64Image,
                        },
                    },
                ],
            },
        ],
    });
    return response.choices[0].message.content;
}

export async function loader({ request }: LoaderFunctionArgs) {
    console.log('Dashboard route');
    let user: IUser = await authenticator.isAuthenticated(request, {
        failureRedirect: "/login",
    });

    const session = await sessionStorage.getSession("_session");
    console.log('Session:', session);
    if (!session) {
        // Redirect or deny access if the session is expired or invalid
        return redirect('/login');
    }
    return { user };
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof Blob)) {
        return json({ error: "Please provide a valid image file." }, { status: 400 });
    }

    const base64Image = Buffer.from(await file.arrayBuffer()).toString("base64");

    const response = await openaiCall(base64Image);
    console.log('Response:', response);

    // Example: Process the file (save it to disk, upload to S3, etc.)
    // Assuming you're saving it to disk in a 'public/uploads' directory:
    // const filePath = path.join(__dirname, "..", "public", "uploads", file.name);
    // await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    // Returning a success message
    return json({ response: response });
}


export default function Dashboard() {
    const imageUploadAction: ActionData = useActionData<ActionData>();
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            alert("Please select a valid image file.");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">

            <Form method="post" encType="multipart/form-data">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                </label>
                <div className="flex items-center justify-center">
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-600 rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-600 hover:text-white">
                        <svg
                            className="w-8 h-8"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M16.88 12.37c1.24-1.09 2-2.69 2-4.37 0-3.31-2.69-6-6-6-2.02 0-3.78 1.02-4.87 2.62C5.17 4.13 4.63 4 4 4c-3.31 0-6 2.69-6 6 0 3.31 2.69 6 6 6h11.88zM6.5 16.5H2.25L8 12.75l4.75 3.75L6.5 16.5zm7.5-.75c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.5-1.75c.35.6.5 1.28.5 2.25s-.25 1.65-.5 2.25H1c-.24-.6-.5-1.4-.5-2.25 0-.97.15-1.65.5-2.25H16.5z" />
                        </svg>
                        <span className="mt-2 text-base leading-normal">Select a file</span>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>
                <button
                    type="submit"
                    className="w-full mt-4 p-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                >
                    Upload
                </button>
            </Form>
            {imagePreview && (
                <div className="mt-4">
                    <img
                        src={imagePreview}
                        alt="Selected Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                </div>
            )}

            {/* Type narrowing to check if actionData has the 'success' or 'error' property */}
            {imageUploadAction && (
                <p className="mt-4 text-green-600">{imageUploadAction.response}</p>
            )}
        </div>
    );
}

