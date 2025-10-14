import { Card, CardContent, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface SalesChartPoint {
  label: string;
  value: number;
}

interface SalesChartProps {
  data: SalesChartPoint[];
}

const SalesChart = ({ data }: SalesChartProps) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Doanh thu đã giải ngân (ETH)
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(value: number) => [`${value.toFixed(2)} ETH`, "Giá trị"]} />
          <Bar dataKey="value" fill="#2e7d32" name="Giải ngân" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default SalesChart;
