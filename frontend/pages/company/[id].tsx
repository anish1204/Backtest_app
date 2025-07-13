import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CompanyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [prices, setPrices] = useState([]);
  const [fundamentals, setFundamentals] = useState([]);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/prices/${id}`).then(res => res.json()).then(setPrices);
    fetch(`http://localhost:8000/fundamentals/${id}`).then(res => res.json()).then(setFundamentals);
  }, [id]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Company {id} Details</h1>
      <h2 className="text-xl mt-4">Prices</h2>
      <pre className="text-xs">{JSON.stringify(prices.slice(0,5), null, 2)}</pre>
      <h2 className="text-xl mt-4">Fundamentals</h2>
      <pre className="text-xs">{JSON.stringify(fundamentals.slice(0,5), null, 2)}</pre>
    </div>
  );
}
