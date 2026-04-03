import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { REVENUE_DATA } from '@/lib/mock-data'

const chartConfig = {
  SP: { label: 'São Paulo (SP)', color: 'hsl(var(--chart-1))' },
  MG: { label: 'Minas Gerais (MG)', color: 'hsl(var(--chart-2))' },
}

export function RevenueChart() {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <CardTitle>Receita Mensal (R$)</CardTitle>
        <CardDescription>Crescimento de faturamento por região via engine IoT</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={REVENUE_DATA}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              tickFormatter={(value) => `R$ ${value / 1000}k`}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-xs"
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="SP" fill="var(--color-SP)" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="MG" fill="var(--color-MG)" radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
