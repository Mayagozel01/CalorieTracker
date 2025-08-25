import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { calculateAndSaveGoals, setGuestId } from '../../../redux/slices/FoodSlice';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '../../../lib/firebase';

const OnboardingForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { guestId } = useSelector((state) => state.food);
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    height: '',
    currentWeight: '',
    activityLevel: '',
    goalType: '',
    targetWeight: '',
    targetDate: '',
  });
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!formData.gender) return 'Пожалуйста, выберите пол.';
    const age = Number(formData.age);
    if (!age || age <= 0) return 'Пожалуйста, введите корректный возраст.';
    const height = Number(formData.height);
    if (!height || height <= 0) return 'Пожалуйста, введите корректный рост.';
    const currentWeight = Number(formData.currentWeight);
    if (!currentWeight || currentWeight <= 0) return 'Пожалуйста, введите корректный текущий вес.';
    const activityLevel = Number(formData.activityLevel);
    if (!activityLevel || activityLevel < 1.2 || activityLevel > 1.9) return 'Пожалуйста, введите уровень активности (1.2–1.9).';
    const targetWeight = Number(formData.targetWeight);
    if (!targetWeight || targetWeight <= 0) return 'Пожалуйста, введите корректный целевой вес.';
    if (!formData.targetDate) return 'Пожалуйста, выберите целевую дату.';
    const today = new Date();
    const selectedDate = new Date(formData.targetDate);
    if (selectedDate < today) return 'Целевая дата должна быть в будущем.';
    if (!formData.goalType) return 'Пожалуйста, выберите тип цели.';
    return '';
  }, [formData]);

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    const newGuestId = guestId || uuidv4();
    dispatch(setGuestId(newGuestId)); // Сохраняем guestId в Redux

    dispatch(calculateAndSaveGoals(formData))
      .unwrap()
      .then(() => {
        toast.success('Цели сохранены! 🎉 Войдите, чтобы сохранить прогресс.');
        navigate('/maindashboard'); // Перенаправляем на страницу входа для гостей
      })
      .catch((err) => {
        setError('Ошибка сохранения: ' + err);
        toast.error('Ошибка сохранения: ' + err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-blue-50">
      <Card className="w-full max-w-md rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-teal-700">
            Давай достигнем твоей цели{auth.currentUser?.displayName ? auth.currentUser?.displayName : null}! 🚀
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Пол</label>
            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите пол" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Мужской</SelectItem>
                <SelectItem value="female">Женский</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Возраст (лет)</label>
            <Input
              type="number"
              name="age"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              placeholder="Введите возраст"
              min="0"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Рост (см)</label>
            <Input
              type="number"
              name="height"
              value={formData.height}
              onChange={(e) => handleChange('height', e.target.value)}
              placeholder="Введите рост"
              min="0"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Текущий вес (кг)</label>
            <Input
              type="number"
              name="currentWeight"
              value={formData.currentWeight}
              onChange={(e) => handleChange('currentWeight', e.target.value)}
              placeholder="Введите текущий вес"
              min="0"
              step="0.1"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Уровень активности (1.2–1.9)</label>
            <Input
              type="number"
              name="activityLevel"
              value={formData.activityLevel}
              onChange={(e) => handleChange('activityLevel', e.target.value)}
              placeholder="Например, 1.2 (сидячий), 1.55 (умеренный)"
              min="1.2"
              max="1.9"
              step="0.1"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Целевой вес (кг)</label>
            <Input
              type="number"
              name="targetWeight"
              value={formData.targetWeight}
              onChange={(e) => handleChange('targetWeight', e.target.value)}
              placeholder="Введите целевой вес"
              min="0"
              step="0.1"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Целевая дата</label>
            <Input
              type="date"
              name="targetDate"
              value={formData.targetDate}
              onChange={(e) => handleChange('targetDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ваша цель</label>
            <Select value={formData.goalType} onValueChange={(value) => handleChange('goalType', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите цель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">Похудеть</SelectItem>
                <SelectItem value="gain">Набрать вес</SelectItem>
                <SelectItem value="maintain">Поддерживать вес</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleSubmit} variant="teal" className="text-xl text-center text-teal-700 hover:text-teal-50">Сохранить</Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            Ты на пути к своей цели! 🌟
          </p>
          <div className="text-center">
            {!auth.currentUser?.displayName?
            <Link to="/login">
              <Button variant="teal" className="text-xl text-center text-teal-700 hover:text-teal-50">Войти</Button></Link>:null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;