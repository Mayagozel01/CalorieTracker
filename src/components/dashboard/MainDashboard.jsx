import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FoodItem from './FoodItem';
import { addFood, saveDailyReport, loadDailyReport, loadUserGoals, updateWeight } from '../../redux/slices/FoodSlice';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const CircularProgress = ({ progress, size = 100, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        r={radius}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        stroke="#10b981"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-lg font-semibold fill-current"
      >
        {progress}%
      </text>
    </svg>
  );
};

function MainDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: foodItems, totalCalories, goals, status, error, guestId } = useSelector((state) => state.food);
  const [foodName, setFoodName] = useState('');
  const [foodWeight, setFoodWeight] = useState('');
  const [foodCalories, setFoodCalories] = useState('');
  const [currentWeightInput, setCurrentWeightInput] = useState('');
  const date = new Date().toISOString().split('T')[0];
  const dailyGoal = goals?.dailyGoal || 2000;
  const calorieProgress = Math.min((totalCalories / dailyGoal) * 100, 100).toFixed(0);
  const remainingCalories = dailyGoal - totalCalories;

  useEffect(() => {
    dispatch(loadUserGoals({ guestId }));
    dispatch(loadDailyReport({ date, guestId }));
    if (!goals && status !== 'loading') {
      navigate('/onboarding'); // Redirect to onboarding if no goals
    }
  }, [dispatch, date, guestId, goals, status, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(`Ошибка: ${error}`);
    }
  }, [error]);

  const getMotivationalMessage = () => {
    if (remainingCalories > dailyGoal * 0.5) return 'Ты на верном пути! 🚀';
    if (remainingCalories > 0) return 'Отлично, продолжай в том же духе! 💪';
    return 'Притормози, ты превысил цель 😅';
  };

  const handleAddFood = async () => {
    if (!foodName || !foodWeight) {
      toast.error('Укажите название и вес еды');
      return;
    }
    let calories = foodCalories ? parseFloat(foodCalories) : null;
    const meal = {
      id: Date.now(),
      name: foodName,
      weight: parseFloat(foodWeight),
      calories,
      timestamp: new Date().toISOString(),
    };
    dispatch(addFood(meal));
    dispatch(saveDailyReport({ date, meals: [...foodItems, meal], totalCalories: totalCalories + (meal.calories || 0), guestId }))
      .then(() => toast.success('Еда добавлена! 🎉'));
    setFoodName('');
    setFoodWeight('');
    setFoodCalories('');
    document.getElementById('foodName')?.focus();
  };

  const handleUpdateWeight = () => {
    if (!currentWeightInput || Number(currentWeightInput) <= 0) {
      toast.error('Введите корректный вес');
      return;
    }
    dispatch(updateWeight({ date, weight: parseFloat(currentWeightInput), guestId }))
      .then(() => toast.success('Вес обновлён! ⚖️'));
    setCurrentWeightInput('');
  };

  const daysToTarget = goals?.targetDate
    ? Math.max(1, Math.round((new Date(goals.targetDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const weightToChange = goals ? goals.targetWeight - goals.currentWeight : null;
  const dailyWeightChange = daysToTarget && weightToChange ? (weightToChange / daysToTarget).toFixed(2) : null;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 flex flex-col gap-4 bg-gradient-to-b from-teal-50 to-blue-50">
      {status === 'loading' && <p className="text-center text-gray-600">Загрузка...</p>}
      {guestId && (
        <p className="text-center text-sm text-yellow-600">
          Вы используете гостевой режим. <Link to="/login" className="underline">Войдите</Link>, чтобы сохранить прогресс!
        </p>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-4"
      >
        <h2 className="text-lg font-semibold mb-2">Ежедневная сводка</h2>
        <p className="text-sm text-gray-600 mb-4">
          {new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {goals ? (
          <div className="mb-4">
            <p><span className="font-medium">Цель:</span> {goals.goalType === 'lose' ? 'Похудеть' : goals.goalType === 'gain' ? 'Набрать вес' : 'Поддерживать вес'}</p>
            <p><span className="font-medium">Текущий вес:</span> {goals.currentWeight} кг</p>
            <p><span className="font-medium">Целевой вес:</span> {goals.targetWeight} кг</p>
            <p><span className="font-medium">Дата достижения:</span> {new Date(goals.targetDate).toLocaleDateString('ru-RU')}</p>
            {dailyWeightChange && (
              <p><span className="font-medium">Ежедневное изменение:</span> {dailyWeightChange > 0 ? '+' : ''}{dailyWeightChange} кг/день</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">Задайте цель в профиле, чтобы отслеживать прогресс! 🌟</p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <CircularProgress progress={calorieProgress} />
          <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
            <p><span className="font-medium">Потреблено:</span> {totalCalories} ккал</p>
            <p><span className="font-medium">Цель:</span> {dailyGoal} ккал</p>
            <p><span className="font-medium">{remainingCalories >= 0 ? 'Остаток' : 'Превышение'}:</span> {Math.abs(remainingCalories)} ккал</p>
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-green-600 text-center"
        >
          {getMotivationalMessage()}
        </motion.p>
        <div className="mt-4 flex items-center justify-center flex-col">
          <Input
            type="number"
            value={currentWeightInput}
            onChange={(e) => setCurrentWeightInput(e.target.value)}
            placeholder="Обновить вес (кг)"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button onClick={handleUpdateWeight}variant="teal" className="m-4 text-xl text-center text-teal-700 hover:text-teal-50">
            Обновить вес
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-lg shadow p-4"
      >
        <h2 className="text-lg font-semibold mb-2">Добавить приём пищи</h2>
        <div className="space-y-4  flex flex-col justify-center items-center">
          <input
            id="foodName"
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="Название еды"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          <input
            type="number"
            value={foodWeight}
            onChange={(e) => setFoodWeight(e.target.value)}
            placeholder="Вес (г)"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            value={foodCalories}
            onChange={(e) => setFoodCalories(e.target.value)}
            placeholder="Калории (опционально)"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button onClick={handleAddFood} variant="teal" className="text-xl text-center text-teal-700 hover:text-teal-50">

            Добавить еду
            </Button>
        </div>
      </motion.div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Список еды</h2>
        {foodItems.length === 0 ? (
          <p className="text-center text-gray-600">Пока ничего не записано. Что ты сегодня ел? 😋</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {foodItems.map((item) => (
              <FoodItem
                key={item.id}
                id={item.id}
                name={item.name}
                weight={item.weight}
                calories={item.calories}
                timestamp={new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                guestId={guestId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainDashboard;