
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcesses } from "@/hooks/useProcesses";

const DepartmentStatusChart = () => {
  const { processes, departments } = useProcesses();

  // Count processes by department
  const departmentCounts = departments.map((department) => {
    const count = processes.filter(
      (process) => process.currentDepartment === department.id
    ).length;

    return {
      name: department.name,
      count,
    };
  });

  // Filter out departments with no processes
  const filteredData = departmentCounts.filter((item) => item.count > 0);

  // Colors for the bars
  const colors = [
    "#2563eb", // primary
    "#4f86f7",
    "#799cf8",
    "#a4b3f9",
    "#cedafa",
    "#f8fafc",
  ];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Processos por Departamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{fontSize: 12}}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => [`${value} processos`, "Quantidade"]}
                labelStyle={{ color: "#1e293b" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {filteredData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentStatusChart;
