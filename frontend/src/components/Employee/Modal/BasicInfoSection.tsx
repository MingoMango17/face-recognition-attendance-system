import React from "react";

interface BasicInfoSectionProps {
    formData: {
        first_name: string;
        last_name: string;
        email: string;
        department?: string;
        password: string;
        salary: string;
        salary_type: "hourly" | "monthly";
    };
    departments: string[];
    mode: "add" | "edit";
    loading: boolean;
    onChange: (field: string, value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    formData,
    departments,
    mode,
    loading,
    onChange,
}) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">
                    First Name *
                </label>
                <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => onChange("first_name", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">
                    Last Name *
                </label>
                <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => onChange("last_name", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">
                    Email *
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">
                    Department
                </label>
                <select
                    value={formData.department}
                    onChange={(e) => onChange("department", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                    ))}
                </select>
            </div>
            {/* Password field - only show for add mode or if user wants to change password */}
            {mode === "add" && (
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Password *
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => onChange("password", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                    />
                </div>
            )}
            {mode === "edit" && (
                <div>
                    <label className="block text-sm font-medium mb-1">
                        New Password (optional)
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => onChange("password", e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        placeholder="Leave blank to keep current password"
                        disabled={loading}
                    />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium mb-1">
                    Salary Type *
                </label>
                <select
                    value={formData.salary_type}
                    onChange={(e) =>
                        onChange("salary_type", e.target.value as "hourly" | "monthly")
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                >
                    <option value="hourly">Hourly</option>
                    <option value="monthly">Monthly</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">
                    Salary *
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={(e) => onChange("salary", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder={
                        formData.salary_type === "hourly"
                            ? "Per hour"
                            : "Monthly amount"
                    }
                    required
                    disabled={loading}
                />
            </div>
        </div>
    );
};

export default BasicInfoSection;