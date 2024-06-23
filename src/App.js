import React, {useState} from 'react';
import questions from './data.json'

const drinks = [
    {name: "چای گیاهی", minScore: 10, maxScore: 15},
    {name: "لاته", minScore: 16, maxScore: 20},
    {name: "کاپوچینو", minScore: 21, maxScore: 25},
    {name: "اسپرسو", minScore: 26, maxScore: 30}
];

const getRecommendation = (totalScore) => {
    for (let drink of drinks) {
        if (totalScore >= drink.minScore && totalScore <= drink.maxScore) {
            return drink.name;
        }
    }
    return "آب";
};

const CoffeeRecommendation = () => {
    const [answers, setAnswers] = useState({});
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [result, setResult] = useState(null);

    const handleChange = (questionId, score) => {
        setAnswers({
            ...answers,
            [questionId]: score
        });
    };

    const handleSubmit = async () => {
        const totalScore = Object.values(answers).reduce((acc, score) => acc + score, 0);
        const recommendation = getRecommendation(totalScore);
        setResult(recommendation);

        // Send data to Google Sheets
        const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
            method: 'POST',
            body: JSON.stringify({name, phone, recommendation}),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Data sent to Google Sheets');
        } else {
            console.error('Error sending data to Google Sheets');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4" dir="rtl">
            <h1 className="text-3xl font-bold mb-6">Rob Coffee | کافه راب</h1>
            {!result && <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        نام:
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        شماره تلفن:
                    </label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
                {questions.map(question => (
                    <div key={question.id} className="mb-4">
                        <p className="text-gray-700 font-semibold mb-2 text-right">{question.question}</p>
                        {question.options.map(option => (
                            <label key={option.text} className="block">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option.score}
                                    onChange={() => handleChange(question.id, option.score)}
                                    className="ml-2"
                                />
                                {option.text}
                            </label>
                        ))}
                    </div>
                ))}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                >
                    تایید
                </button>
            </div>}
            {result && (
                <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg">
                    <h2 className="text-xl font-semibold">ما به شما توصیه می‌کنیم که {result} را امتحان کنید</h2>
                </div>
            )}
        </div>
    );
};

export default CoffeeRecommendation;
