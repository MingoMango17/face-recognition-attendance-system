import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface Deduction {
    type: number;
    amount: string;
}

interface DeductionsSectionProps {
    deductions: Deduction[];
    deductionTypes: string[];
    loading: boolean;
    onAdd: () => void;
    onUpdate: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
}

const DeductionsSection: React.FC<DeductionsSectionProps> = ({
    deductions,
    deductionTypes,
    loading,
    onAdd,
    onUpdate,
    onRemove,
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Deductions</h3>
                <button
                    type="button"
                    onClick={onAdd}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    disabled={loading}
                >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                </button>
            </div>
            {deductions.map((deduction, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <select
                        value={deductionTypes[deduction.type]}
                        onChange={(e) =>
                            onUpdate(index, "type", e.target.value)
                        }
                        className="flex-1 border rounded px-2 py-1"
                        disabled={loading}
                    >
                        {deductionTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={deduction.amount}
                        onChange={(e) =>
                            onUpdate(index, "amount", e.target.value)
                        }
                        className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={loading}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default DeductionsSection;
