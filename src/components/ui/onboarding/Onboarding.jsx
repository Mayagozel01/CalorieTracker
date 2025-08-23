import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OnboardingForm = () => {
  const [formData, setFormData] = useState({
    currentWeight: '',
    targetWeight: '',
    targetDate: '',
    goalType: '',
  });
  const [error, setError] = useState('');

  // Handle input changes
  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on change
  }, []);

  // Validate all fields
  const validateForm = useCallback(() => {
    const weight = Number(formData.currentWeight);
    if (!weight || weight <= 0) {
      return 'Please enter a valid current weight greater than 0.';
    }
    const targetWeight = Number(formData.targetWeight);
    if (!targetWeight || targetWeight <= 0) {
      return 'Please enter a valid target weight greater than 0.';
    }
    if (!formData.targetDate) {
      return 'Please select a target date.';
    }
    const today = new Date();
    const selectedDate = new Date(formData.targetDate);
    if (selectedDate < today) {
      return 'Target date must be in the future.';
    }
    if (!formData.goalType) {
      return 'Please select a goal type.';
    }
    return '';
  }, [formData]);

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    // Simulate form submission
    console.log('Form submitted:', formData);
    alert(
      `You're on your way to crushing it! 🎉\nCurrent Weight: ${formData.currentWeight} kg\nTarget Weight: ${formData.targetWeight} kg\nTarget Date: ${formData.targetDate}\nGoal: ${formData.goalType}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Let's Reach Your Goal! 🚀
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What's your current weight? (kg)
            </label>
            <Input
              type="number"
              name="currentWeight"
              value={formData.currentWeight}
              onChange={(e) => handleChange('currentWeight', e.target.value)}
              placeholder="Enter weight in kg"
              min="0"
              step="0.1"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What's your target weight? (kg)
            </label>
            <Input
              type="number"
              name="targetWeight"
              value={formData.targetWeight}
              onChange={(e) => handleChange('targetWeight', e.target.value)}
              placeholder="Enter target weight in kg"
              min="0"
              step="0.1"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              By when do you want to reach your goal?
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              What's your goal?
            </label>
            <Select
              value={formData.goalType}
              onValueChange={(value) => handleChange('goalType', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lose Weight">Lose Weight</SelectItem>
                <SelectItem value="Gain Weight">Gain Weight</SelectItem>
                <SelectItem value="Maintain Weight">Maintain Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleSubmit}>
              Submit
            </Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            You're on your way to crushing it! 🌟
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;