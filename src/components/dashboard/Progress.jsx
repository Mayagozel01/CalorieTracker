"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "../ui/button"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { motion } from "framer-motion"
import { loadUserGoals, loadAllReports } from "../../redux/slices/FoodSlice"
import { Link } from "react-router-dom"

export default function ProgressPage() {
  const dispatch = useDispatch()
  const { goals, reports, status } = useSelector((state) => state.food)

  useEffect(() => {
    dispatch(loadUserGoals())
    dispatch(loadAllReports())
  }, [dispatch])

  const weightData = reports
    .filter((report) => report.weight)
    .map((report) => ({
      date: new Date(report.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
      weight: report.weight,
    }))

  const calorieData = reports.map((report) => ({
    date: new Date(report.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
    calories: report.totalCalories,
  }))

  const daysLeft = goals?.targetDate
    ? Math.max(1, Math.round((new Date(goals.targetDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  const currentWeight = goals?.currentWeight || weightData[weightData.length - 1]?.weight || 0
  const targetWeight = goals?.targetWeight || 0
  const dailyWeightChange = daysLeft && targetWeight && currentWeight
    ? ((targetWeight - currentWeight) / daysLeft).toFixed(2)
    : 0
  const projectedWeightData = weightData.length
    ? [...weightData, {
        date: new Date(goals?.targetDate).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
        weight: targetWeight,
      }]
    : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-screen flex-col items-center justify-start p-6 bg-gradient-to-b from-teal-50 to-blue-50"
    >
      <Card className="w-full max-w-3xl rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-teal-700">Прогресс</CardTitle>
          <CardDescription className="text-gray-500">
            Следи за историей веса и калорий
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && <p className="text-center text-gray-600">Загрузка...</p>}
          {status === "failed" && <p className="text-center text-red-500">Ошибка загрузки данных</p>}
          {goals && (
            <div className="mb-4 text-sm text-gray-600">
              <p><span className="font-medium">Текущий вес:</span> {currentWeight} кг</p>
              <p><span className="font-medium">Целевой вес:</span> {targetWeight} кг</p>
              <p><span className="font-medium">Осталось дней:</span> {daysLeft}</p>
              <p><span className="font-medium">Цель:</span> {goals.goalType === "lose" ? "Похудеть" : goals.goalType === "gain" ? "Набрать вес" : "Поддерживать вес"}</p>
            </div>
          )}
          <Tabs defaultValue="weight" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-teal-100 rounded-lg">
              <TabsTrigger value="weight" className="rounded-lg">Вес</TabsTrigger>
              <TabsTrigger value="calories" className="rounded-lg">Калории</TabsTrigger>
            </TabsList>

            {/* Weight Progress */}
            <TabsContent value="weight" className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectedWeightData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-teal-200" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b" }} />
                    <YAxis tick={{ fill: "#64748b" }} domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    {targetWeight > 0 && (
                      <ReferenceLine
                        y={targetWeight}
                        label={{
                          value: `Цель ${targetWeight}кг`,
                          fill: "green",
                          position: "insideTopLeft",
                        }}
                        stroke="green"
                        strokeDasharray="4 4"
                      />
                    )}
                    {currentWeight > 0 && (
                      <ReferenceLine
                        y={currentWeight}
                        label={{
                          value: `Текущий ${currentWeight}кг`,
                          fill: "blue",
                          position: "insideBottomLeft",
                        }}
                        stroke="blue"
                        strokeDasharray="3 3"
                      />
                    )}
                    {goals?.targetDate && (
                      <ReferenceLine
                        x={new Date(goals.targetDate).toLocaleDateString("ru-RU", { month: "short", day: "numeric" })}
                        label={{
                          value: `Цель ${new Date(goals.targetDate).toLocaleDateString("ru-RU")}`,
                          fill: "orange",
                          position: "top",
                        }}
                        stroke="orange"
                        strokeDasharray="4 2"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="calories" className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={calorieData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-teal-200" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b" }} />
                    <YAxis tick={{ fill: "#64748b" }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    {goals?.dailyGoal && (
                      <ReferenceLine
                        y={goals.dailyGoal}
                        label={{
                          value: `Цель ${goals.dailyGoal} ккал`,
                          fill: "green",
                          position: "insideTopLeft",
                        }}
                        stroke="green"
                        strokeDasharray="4 4"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
          <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="bg-white rounded-lg shadow p-4 flex justify-center">
        <Link to="/maindashboard" >
          <Button variant="teal" className="text-xl text-teal-700 hover:text-teal-50">Назад на главную</Button>
        </Link>
      </motion.div>
        </CardContent>
      </Card>
      
    </motion.div>
  )
}