import Chart from "@/components/Chart";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gray-900 text-white">
      <div className="w-full">
        <h1 className="text-3xl font-bold text-center p-4">FindScan - Bollinger Bands Chart</h1>
        <Chart />
      </div>
    </main>
  );
}