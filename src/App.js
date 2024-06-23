import React, { useState } from 'react';
import questions from './data.json';
import { twMerge } from 'tailwind-merge';

const drinks = [
  { name: 'چای گیاهی', minScore: 10, maxScore: 15 },
  { name: 'لاته', minScore: 16, maxScore: 20 },
  { name: 'کاپوچینو', minScore: 21, maxScore: 25 },
  { name: 'اسپرسو', minScore: 26, maxScore: 30 },
];

const getRecommendation = (totalScore) => {
  for (let drink of drinks) {
    if (totalScore >= drink.minScore && totalScore <= drink.maxScore) {
      return drink.name;
    }
  }
  return 'آب';
};

const CoffeeRecommendation = () => {
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);

  const handleChange = (questionId, score) => {
    setAnswers({
      ...answers,
      [questionId]: score,
    });
  };

  const handleSubmit = async () => {
    const newErrors = {};
    const unanswered = [];

    // Validate full name
    if (!name.trim()) {
      newErrors.name = 'نام کامل نباید خالی باشد.';
    }

    // Validate phone number
    const phoneRegex = /(0?9)\d{2}\W?\d{3}\W?\d{4}/g;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = 'شماره تلفن نامعتبر است. مثال: ۰۹۱۲۱۲۳۴۵۶۷';
    }

    // Validate answers
    questions.forEach((question) => {
      if (!answers[question.id]) {
        unanswered.push(question.id);
      }
    });

    if (unanswered.length > 0) {
      newErrors.answers = 'لطفاً به همه سوالات پاسخ دهید.';
    }

    // If there are errors, set the errors and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setUnansweredQuestions(unanswered);
      return;
    }

    setErrors({}); // Clear errors if no validation issues

    const totalScore = Object.values(answers).reduce((acc, score) => acc + score, 0);
    const recommendation = getRecommendation(totalScore);
    setResult(recommendation);

    // Send data to Google Sheets
    const response = await fetch('https://script.google.com/macros/s/AKfycbwIgad6cI_Ecrfgo7vv01yClWsHNpe6mXrFQJZIn07AvH8PhUfRbhMV6thEuBJCkW5p/exec', {
      redirect: 'follow',
      method: 'POST',
      body: JSON.stringify({ name, phone, recommendation: 'test hadiz' }),
      headers: {
        'Content-Type': 'text/plain;charse=utf=8',
      },
    });

    if (response.ok) {
      console.log('Data sent to Google Sheets');
    } else {
      console.error('Error sending data to Google Sheets');
    }
  };

  const renderSurveyAndForm = (
    <div className='w-full max-w-md bg-white p-6 rounded-lg shadow-md'>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>
          نام کامل:
        </label>
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300'
        />
        {errors.name && <p className='text-red-500 text-xs italic'>{errors.name}</p>}
      </div>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>
          شماره تلفن:
        </label>
        <input
          type='text'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder='مانند: ۰۹۱۲۱۲۳۴۵۶۷'
          className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300'
        />
        {errors.phone && <p className='text-red-500 text-xs italic'>{errors.phone}</p>}
      </div>
      {questions.map(question => (
        <div key={question.id}
             className={twMerge('mb-4', unansweredQuestions.includes(question.id) && 'border border-red-500 p-2 rounded')}>
          <p
            className={twMerge('text-gray-700 font-semibold mb-2 text-right', unansweredQuestions.includes(question.id) && 'text-red-500')}>
            {question.question}
          </p>
          {question.options.map(option => (
            <label key={option.text} className='block'>
              <input
                type='radio'
                name={`question-${question.id}`}
                value={option.score}
                onChange={() => handleChange(question.id, option.score)}
                className='ml-2'
              />
              {option.text}
            </label>
          ))}
        </div>
      ))}
      {errors.answers && <p className='text-red-500 text-xs italic mb-2'>{errors.answers}</p>}
      {errors.phone && <p className='text-red-500 text-xs italic mb-2'>{errors.phone}</p>}
      {errors.name && <p className='text-red-500 text-xs italic mb-2'>{errors.name}</p>}
      <button
        onClick={handleSubmit}
        className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300'
      >ثبت ☕
      </button>
    </div>
  );

  const renderResult = <div className='mt-6 p-4 bg-green-100 text-green-700 rounded-lg'>
    <h2 className='text-xl font-semibold'>ما به شما توصیه می‌کنیم که {result} را امتحان کنید</h2>
  </div>;

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center p-4' dir='rtl'>
      <h1 className='text-3xl font-bold mb-6'>Rob Coffee | کافه راب</h1>
      {!result ? renderSurveyAndForm : renderResult}
    </div>
  );
};

export default CoffeeRecommendation;
