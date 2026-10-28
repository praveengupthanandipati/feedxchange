import { Bar, BarChart, ResponsiveContainer } from "recharts";

interface MiniBarChartProps {
  data: number[];
  color: string;
}

const MiniBarChart = ({ data, color }: MiniBarChartProps) => {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <ResponsiveContainer width={90} height={48}>
      <BarChart data={chartData} barGap={2}>
        <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MiniBarChart;
