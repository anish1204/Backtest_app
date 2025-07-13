import { useState, useEffect } from "react";
import axios from "axios";

type Strategy = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  parameters: any;
};

// Define some standard templates
const strategyTemplates = [
  {
    name: "Top ROE",
    description: "Selects top companies by Return on Equity.",
    parameters: {
      filter: { ROE_min: 15 },
      ranking: ["ROE DESC"],
      position_sizing: "equal_weight",
    },
  },
  {
    name: "Low P/E",
    description: "Selects companies with lowest Price/Earnings ratio.",
    parameters: {
      filter: { PE_max: 10 },
      ranking: ["PE ASC"],
      position_sizing: "equal_weight",
    },
  },
  {
    name: "Large Cap Growth",
    description: "Focuses on large-cap companies with high EPS growth.",
    parameters: {
      filter: { market_cap_min: 10000, EPS_growth_min: 10 },
      ranking: ["EPS_growth DESC"],
      position_sizing: "equal_weight",
    },
  },
];

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parameters, setParameters] = useState("{}");

  const [selectedTemplate, setSelectedTemplate] = useState("");

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = () => {
    axios.get("http://localhost:8000/strategies/").then((res) => {
      setStrategies(res.data);
      setLoading(false);
    });
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    const template = strategyTemplates.find((t) => t.name === value);
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setParameters(JSON.stringify(template.parameters, null, 2));
    } else {
      setName("");
      setDescription("");
      setParameters("{}");
    }
  };

  const createStrategy = () => {
    axios
      .post("http://localhost:8000/strategies/", {
        name,
        description,
        parameters: JSON.parse(parameters),
      })
      .then(() => {
        setName("");
        setDescription("");
        setParameters("{}");
        setSelectedTemplate("");
        fetchStrategies();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Strategies</h1>

      <div className="mb-8 space-y-2">
        <h2 className="text-xl font-semibold">Create New Strategy</h2>

        <select
          value={selectedTemplate}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">-- Select a Template --</option>
          {strategyTemplates.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="Parameters (JSON)"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
          className="border p-2 w-full"
          rows={6}
        />

        <button
          onClick={createStrategy}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Existing Strategies</h2>
      <ul className="space-y-2">
        {strategies.map((s) => (
          <li key={s.id} className="border p-2 rounded">
            <h3 className="font-bold">{s.name}</h3>
            <p>{s.description}</p>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(s.parameters, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
