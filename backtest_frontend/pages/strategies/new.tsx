import { useState } from "react";
import { useRouter } from "next/router";

export default function NewStrategy() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parameters, setParameters] = useState("{}");
  const router = useRouter();

  const handleSubmit = async () => {
    await fetch("http://localhost:8000/strategies/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, parameters: JSON.parse(parameters) }),
    });
    router.push("/strategies");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">New Strategy</h1>
      <input
        placeholder="Name"
        className="border p-2 m-2"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        placeholder="Description"
        className="border p-2 m-2"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <textarea
        placeholder='Parameters (JSON)'
        className="border p-2 m-2 w-full h-40"
        value={parameters}
        onChange={e => setParameters(e.target.value)}
      />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2">Save</button>
    </div>
  );
}
