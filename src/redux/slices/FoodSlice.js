import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db,auth } from '../../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// Сохранение целей и расчёт dailyGoal
export const calculateAndSaveGoals = createAsyncThunk(
  'food/calculateAndSaveGoals',
  async ({ gender, age, height, currentWeight, activityLevel, goalType, targetWeight, targetDate }, { rejectWithValue }) => {
    try {
      let userId = auth.currentUser?.uid;
      let isGuest = false;
      let collectionPath = 'users';

      if (!userId) {
        // Generate a temporary ID for unauthenticated users
        userId = uuidv4();
        isGuest = true;
        collectionPath = 'guests';
      }

      // Расчёт BMR (Харриса-Бенедикта)
      let bmr;
      if (gender === 'female') {
        bmr = 655 + (9.6 * currentWeight) + (1.8 * height) - (4.7 * age);
      } else {
        bmr = 66 + (13.7 * currentWeight) + (5 * height) - (6.8 * age);
      }

      // Расчёт TDEE
      const tdee = bmr * activityLevel;

      // Корректировка по цели
      let dailyGoal;
      if (goalType === 'lose') dailyGoal = tdee - 500;
      else if (goalType === 'gain') dailyGoal = tdee + 500;
      else dailyGoal = tdee;

      // Данные для сохранения
      const goalsData = {
        gender,
        age: Number(age),
        height: Number(height),
        currentWeight: Number(currentWeight),
        activityLevel: Number(activityLevel),
        goalType,
        targetWeight: Number(targetWeight),
        targetDate,
        dailyGoal: Math.round(dailyGoal),
        updatedAt: new Date().toISOString(),
        isGuest, // Флаг для идентификации гостевых данных
        guestId: isGuest ? userId : null, // Сохраняем guestId для возможного слияния
      };

      // Сохранение в Firestore
      const goalsRef = doc(db, `${collectionPath}/${userId}/goals/goals`);
      await setDoc(goalsRef, goalsData, { merge: true });

      return goalsData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Загрузка целей
export const loadUserGoals = createAsyncThunk(
  'food/loadUserGoals',
  async ({ guestId } = {}, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid || guestId;
      if (!userId) throw new Error('Идентификатор пользователя отсутствует');
      const collectionPath = auth.currentUser ? 'users' : 'guests';
      const goalsRef = doc(db, `${collectionPath}/${userId}/goals/goals`);
      const docSnap = await getDoc(goalsRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Сохранение дневного отчёта
export const saveDailyReport = createAsyncThunk(
  'food/saveDailyReport',
  async ({ date, meals, totalCalories, weight, guestId }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid || guestId;
      if (!userId) throw new Error('Идентификатор пользователя отсутствует');
      const collectionPath = auth.currentUser ? 'users' : 'guests';
      const reportRef = doc(db, `${collectionPath}/${userId}/dailyReports/${date}`);
      const reportData = {
        date,
        meals,
        totalCalories: Number(totalCalories) || 0,
        weight: Number(weight) || null,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(reportRef, reportData, { merge: true });
      return reportData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Загрузка дневного отчёта
export const loadDailyReport = createAsyncThunk(
  'food/loadDailyReport',
  async ({ date, guestId }, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid || guestId;
      if (!userId) throw new Error('Идентификатор пользователя отсутствует');
      const collectionPath = auth.currentUser ? 'users' : 'guests';
      const reportRef = doc(db, `${collectionPath}/${userId}/dailyReports/${date}`);
      const docSnap = await getDoc(reportRef);
      return docSnap.exists() ? docSnap.data() : { date, meals: [], totalCalories: 0, weight: null };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Загрузка всех отчётов
export const loadAllReports = createAsyncThunk(
  'food/loadAllReports',
  async ({ guestId } = {}, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid || guestId;
      if (!userId) throw new Error('Идентификатор пользователя отсутствует');
      const collectionPath = auth.currentUser ? 'users' : 'guests';
      const reportsRef = collection(db, `${collectionPath}/${userId}/dailyReports`);
      const querySnapshot = await getDocs(reportsRef);
      const reports = [];
      querySnapshot.forEach((doc) => reports.push(doc.data()));
      return reports.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Обновление веса
export const updateWeight = createAsyncThunk(
  'food/updateWeight',
  async ({ date, weight, guestId }, { getState, rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid || guestId;
      if (!userId) throw new Error('Идентификатор пользователя отсутствует');
      const collectionPath = auth.currentUser ? 'users' : 'guests';
      const { items: meals, totalCalories } = getState().food;
      const reportRef = doc(db, `${collectionPath}/${userId}/dailyReports/${date}`);
      const reportData = {
        date,
        meals,
        totalCalories,
        weight: Number(weight),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(reportRef, reportData, { merge: true });

      // Обновление текущего веса в goals
      const goalsRef = doc(db, `${collectionPath}/${userId}/goals/goals`);
      await setDoc(goalsRef, { currentWeight: Number(weight), updatedAt: new Date().toISOString() }, { merge: true });

      return reportData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Слияние гостевых данных с данными авторизованного пользователя
export const mergeGuestData = createAsyncThunk(
  'food/mergeGuestData',
  async ({ guestId }, { getState, rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('Пользователь не авторизован');
      if (!guestId) throw new Error('Гостевой ID отсутствует');

      // Загрузка гостевых целей
      const guestGoalsRef = doc(db, `guests/${guestId}/goals/goals`);
      const guestGoalsSnap = await getDoc(guestGoalsRef);
      if (guestGoalsSnap.exists()) {
        const guestGoals = guestGoalsSnap.data();
        const userGoalsRef = doc(db, `users/${userId}/goals/goals`);
        await setDoc(userGoalsRef, guestGoals, { merge: true });
      }

      // Загрузка и перенос всех гостевых отчётов
      const guestReportsRef = collection(db, `guests/${guestId}/dailyReports`);
      const guestReportsSnap = await getDocs(guestReportsRef);
      const batch = [];
      guestReportsSnap.forEach((doc) => {
        const reportData = doc.data();
        const userReportRef = doc(db, `users/${userId}/dailyReports/${reportData.date}`);
        batch.push(setDoc(userReportRef, reportData, { merge: true }));
      });
      await Promise.all(batch);

      return guestGoalsSnap.exists() ? guestGoalsSnap.data() : null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const foodSlice = createSlice({
  name: 'food',
  initialState: {
    items: [],
    totalCalories: 0,
    goals: null,
    reports: [],
    status: 'idle',
    error: null,
    guestId: null, // Для хранения временного ID
  },
  reducers: {
    addFood: (state, action) => {
      state.items.push(action.payload);
      state.totalCalories += Number(action.payload.calories) || 0;
    },
    removeFood: (state, action) => {
      const removedItem = state.items.find((item) => item.id === action.payload);
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.totalCalories -= Number(removedItem?.calories) || 0;
    },
    setGuestId: (state, action) => {
      state.guestId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateAndSaveGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
        if (action.payload.isGuest) state.guestId = action.payload.guestId;
        state.status = 'succeeded';
      })
      .addCase(calculateAndSaveGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loadUserGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadDailyReport.fulfilled, (state, action) => {
        state.items = action.payload.meals;
        state.totalCalories = action.payload.totalCalories;
        state.status = 'succeeded';
      })
      .addCase(saveDailyReport.fulfilled, (state, action) => {
        state.items = action.payload.meals;
        state.totalCalories = action.payload.totalCalories;
        state.status = 'succeeded';
      })
      .addCase(loadAllReports.fulfilled, (state, action) => {
        state.reports = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadAllReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateWeight.fulfilled, (state, action) => {
        state.goals.currentWeight = action.payload.weight;
        state.status = 'succeeded';
      })
      .addCase(mergeGuestData.fulfilled, (state, action) => {
        state.goals = action.payload;
        state.guestId = null; // Очищаем guestId после слияния
        state.status = 'succeeded';
      });
  },
});

export const { addFood, removeFood, setGuestId } = foodSlice.actions;
export default foodSlice.reducer;