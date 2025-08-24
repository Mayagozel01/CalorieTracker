import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { mergeGuestData } from '../../../redux/slices/FoodSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { guestId } = useSelector((state) => state.food);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (guestId) {
        await dispatch(mergeGuestData({ guestId })).unwrap();
        toast.success('Гостевые данные перенесены! 🎉');
      }
      toast.success('Вход выполнен! 🚀');
      navigate('/maindashboard');
    } catch (err) {
      setError('Ошибка входа: ' + err.message);
      toast.error('Ошибка входа: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-blue-50">
      <Card className="w-full max-w-md rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-teal-700">
            Вход
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Пароль</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full"
            />
          </div>
          <div className="flex justify-center mt-6 gap-6 items-center">
          <Button onClick={handleLogin}variant="teal" className="text-xl text-center text-teal-700 hover:text-teal-50">

          Войти
</Button>
<Link to="/register" className='text-teal-400'>Регистрация</Link>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;