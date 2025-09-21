import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { api } from "../utils/api";
import EmployeeModal from "../components/Employee/EmployeeModal";
import EmployeeStatsCards from "../components/Employee/EmployeeStatsCards";
import EmployeeSearchBar from "../components/Employee/EmployeeSearchBar";
import EmployeeTable from "../components/Employee/EmployeeTable";
import EmployeePagination from "../components/Employee/EmployeePagination";
import EmployeeHeader from "../components/Employee/EmployeeHeader";

interface Employee {
    id: number;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email?: string;
        username: string;
    };
    salary_type: 1 | 2; // 1 = HOURLY, 2 = MONTHLY
    hire_date: string;
    base_salary: string;
    department: string;
    details: string;
    is_active: boolean;
}

interface EmployeeFilters {
    department: string;
    salary_type: string;
    is_active: string;
}

interface EmployeeFormData {
    first_name: string;
    last_name: string;
    username: string;
    department?: string;
    password: string;
    salary: string;
    salary_type: "hourly" | "monthly";
    deductions: Array<{ type: number; amount: string }>;
    allowances: Array<{ type: number; amount: string; taxable: boolean }>;
}

const EmployeePage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<EmployeeFilters>({
        department: "",
        salary_type: "",
        is_active: "",
    });

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null
    );

    const fetchData = async () => {
        setLoading(true);
        try {
            const request = await api.get("payroll/employees/");
            setEmployees(request.data);
            setFilteredEmployees(request.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = employees.filter((employee) => {
            const fullName =
                `${employee.user.first_name} ${employee.user.last_name}`.toLowerCase();
            const matchesSearch =
                fullName.includes(searchTerm.toLowerCase()) ||
                // employee.user.email
                //     .toLowerCase()
                //     .includes(searchTerm.toLowerCase()) ||
                employee.department
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesDepartment =
                !filters.department ||
                employee.department === filters.department;
            const matchesSalaryType =
                !filters.salary_type ||
                employee.salary_type.toString() === filters.salary_type;
            const matchesActiveStatus =
                !filters.is_active ||
                employee.is_active.toString() === filters.is_active;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesSalaryType &&
                matchesActiveStatus
            );
        });

        setFilteredEmployees(filtered);
        setCurrentPage(1);
    }, [searchTerm, filters, employees]);

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

    const handleAddEmployee = () => {
        setModalMode("add");
        setSelectedEmployee(null);
        setIsModalOpen(true);
    };

    const handleEditEmployee = (employee: Employee) => {
        setModalMode("edit");
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const handleViewEmployee = (employee: Employee) => {
        console.log("View employee:", employee);
        // You can implement a view modal here if needed
    };

    const handleDeleteEmployee = async (employee: Employee) => {
        if (
            window.confirm(
                `Are you sure you want to delete ${employee.user.first_name} ${employee.user.last_name}?`
            )
        ) {
            try {
                await api.delete(`payroll/employees/${employee.id}/`);
                // Refresh the data after deletion
                fetchData();
                console.log("Employee deleted successfully");
            } catch (error) {
                console.error("Error deleting employee:", error);
                // You might want to show an error message to the user
            }
        }
    };

    const handleModalSubmit = async (data: EmployeeFormData) => {
        try {
            if (modalMode === "add") {
                const employeeData = {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    username: data.username,
                    password: data.password,
                    department: data.department,
                    salary_type: data.salary_type === "hourly" ? 1 : 2,
                    base_salary: data.salary,
                    deductions: data.deductions,
                    allowances: data.allowances,
                };

                await api.post("payroll/employees/", employeeData);
                console.log("Employee added successfully");
            } else if (modalMode === "edit" && selectedEmployee) {
                console.log('data', data)
                // Update existing employee
                const employeeData = {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    username: data.username,
                    ...(data.password && { password: data.password }),
                    department: data.department,
                    salary_type: data.salary_type === "hourly" ? 1 : 2,
                    base_salary: data.salary,
                    deductions: data.deductions,
                    allowances: data.allowances,
                };

                await api.patch(
                    `payroll/employees/${selectedEmployee.id}/`,
                    employeeData
                );
                console.log("Employee updated successfully");
            }

            // Refresh the data after add/edit
            fetchData();
        } catch (error) {
            console.error("Error saving employee:", error);
            // You might want to show an error message to the user
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
        setModalMode("add");
    };

    const handleExport = () => {
        console.log("Export employees");
        // Implement export functionality
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    };

    const headerRightContent = (
        <EmployeeHeader
            onAddEmployee={handleAddEmployee}
            onExport={handleExport}
        />
    );

    return (
        <Layout
            headerTitle="Employees"
            headerRightContent={headerRightContent}
            
        >
            <EmployeeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                employee={selectedEmployee}
                mode={modalMode}
            />

            <div className="p-6">
                {/* <EmployeeStatsCards employees={employees} /> */}

                <EmployeeSearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <EmployeeTable
                        employees={currentEmployees}
                        loading={loading}
                        onViewEmployee={handleViewEmployee}
                        onEditEmployee={handleEditEmployee}
                        onDeleteEmployee={handleDeleteEmployee}
                    />

                    {!loading && (
                        <EmployeePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            totalItems={filteredEmployees.length}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default EmployeePage;
