import { useDispatch, useSelector } from 'react-redux';
import { removeFood, saveDailyReport } from '../../redux/slices/FoodSlice';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

function FoodItem({ id, name, weight, calories, timestamp, guestId }) {
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.food);
  const date = new Date().toISOString().split('T')[0];

  const handleRemove = () => {
    dispatch(removeFood(id));
    const updatedMeals = items.filter((item) => item.id !== id);
    const updatedTotalCalories = updatedMeals.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    dispatch(saveDailyReport({ date, meals: updatedMeals, totalCalories: updatedTotalCalories, guestId }))
      .then(() => toast.success('Еда удалена! 🗑️'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-between items-center p-2 border-b"
    >
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-600">
          {weight} г {calories ? `, ${calories} ккал` : ', Оцениваем...'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-500">{timestamp}</p>
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700"
        >
          🗑️
        </button>
      </div>
    </motion.div>
  );
}

export default FoodItem;