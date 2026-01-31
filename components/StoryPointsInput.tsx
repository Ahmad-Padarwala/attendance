'use client';

import { useState, useEffect } from 'react';

interface StoryPointsInputProps {
    value: number | null;
    onChange: (points: number | null) => void;
    onDueDateSuggestion?: (date: Date) => void;
}

export default function StoryPointsInput({ value, onChange, onDueDateSuggestion }: StoryPointsInputProps) {
    const [points, setPoints] = useState<string>(value?.toString() || '');

    useEffect(() => {
        setPoints(value?.toString() || '');
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPoints(val);

        if (val === '' || val === '0') {
            onChange(null);
            return;
        }

        const numVal = parseInt(val);
        if (!isNaN(numVal) && numVal > 0) {
            onChange(numVal);

            // Suggest due date based on story points (1 point = 1 day)
            if (onDueDateSuggestion) {
                const suggestedDate = new Date();
                suggestedDate.setDate(suggestedDate.getDate() + numVal);
                onDueDateSuggestion(suggestedDate);
            }
        }
    };

    const getEstimateLabel = () => {
        const numPoints = parseInt(points);
        if (isNaN(numPoints) || numPoints === 0) return '';

        if (numPoints <= 3) return 'Small';
        if (numPoints <= 7) return 'Medium';
        return 'Large';
    };

    const getEstimateColor = () => {
        const numPoints = parseInt(points);
        if (isNaN(numPoints) || numPoints === 0) return '';

        if (numPoints <= 3) return 'text-green-600';
        if (numPoints <= 7) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getEstimatedDays = () => {
        const numPoints = parseInt(points);
        if (isNaN(numPoints) || numPoints === 0) return '';

        return `~${numPoints} day${numPoints > 1 ? 's' : ''}`;
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Story Points
                <span className="text-gray-500 font-normal ml-2 text-xs">(1 point = 1 day)</span>
            </label>
            <div className="flex items-center gap-3">
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={points}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-semibold text-gray-900"
                />

                {points && parseInt(points) > 0 && (
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${getEstimateColor()}`}>
                            {getEstimateLabel()}
                        </span>
                        <span className="text-sm text-gray-600">
                            {getEstimatedDays()}
                        </span>
                    </div>
                )}
            </div>

            {points && parseInt(points) > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                    💡 Estimated completion: {getEstimatedDays()} from start date
                </div>
            )}
        </div>
    );
}
