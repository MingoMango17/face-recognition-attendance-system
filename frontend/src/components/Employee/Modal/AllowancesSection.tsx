import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface Allowance {
    type: string;
    amount: string;
    taxable: boolean;
}

interface AllowancesSectionProps {
    allowances: Allowance[];
    allowanceTypes: string[];
    loading: boolean;
    onAdd: () => void;
    onUpdate: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
}

const AllowancesSection: React.FC<AllowancesSectionProps> = ({
    allowances,
    allowanceTypes,
    loading,
    onAdd,
    onUpdate,
    onRemove,
}) => {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Allowances</h3>
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
            {allowances.map((allowance, index) => (
                <div
                    key={index}
                    className="flex items-center space-x-2 mb-2"
                >
                    <select
                        value={allowance.type}
                        onChange={(e) =>
                            onUpdate(index, "type", e.target.value)
                        }
                        className="flex-1 border rounded px-2 py-1"
                        disabled={loading}
                    >
                        {allowanceTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        step="0.01"
                        value={allowance.amount}
                        onChange={(e) =>
                            onUpdate(index, "amount", e.target.value)
                        }
                        className="w-24 border rounded px-2 py-1"
                        placeholder="Amount"
                        disabled={loading}
                    />
                    <label className="flex items-center text-sm">
                        <input
                            type="checkbox"
                            checked={allowance.taxable}
                            onChange={(e) =>
                                onUpdate(index, "taxable", e.target.checked)
                            }
                            className="mr-1"
                            disabled={loading}
                        />
                        Taxable
                    </label>
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

export default AllowancesSection;