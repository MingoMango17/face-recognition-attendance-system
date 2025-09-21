import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { api } from "../utils/api";
import PayslipModal from "../components/Payslip/PayslipModal";
import PayslipViewer from "../components/Payslip/PayslipViewer";
import PayslipSearchBar from "../components/Payslip/PayslipSearchBar";
import PayslipTable from "../components/Payslip/PayslipTable";
import PayslipPagination from "../components/Payslip/PayslipPagination";
import PayslipHeader from "../components/Payslip/PayslipHeader";
import { downloadPayslipPDF } from "../utils/pdfGenerator";

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

interface Payslip {
    id: number;
    employee: Employee;
    total_working_days: number;
    days_worked: number;
    total_hours: number;
    regular_hours: number;
    gross_salary: string;
    net_salary: string;
    status: 1 | 2 | 3 | 4 | 5; // DRAFT, GENERATED, APPROVED, PAID, CANCELLED
    start_date: string;
    end_date: string;
    generated_at: string;
    approved_at?: string;
}

interface PayslipFilters {
    status: string;
    department: string;
    employee: string;
    period: string;
}

interface PayslipFormData {
    employee_ids: number[];
    start_date: string;
    end_date: string;
    total_working_days: number;
    auto_calculate_attendance?: boolean;
    pay_frequency: string;
}

interface BulkPayslipFormData {
    start_date: string;
    end_date: string;
    total_working_days: number;
    department?: string;
    employee_ids?: number[];
    auto_calculate_attendance?: boolean;
    pay_frequency: string;
}

const PayslipPage: React.FC = () => {
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<PayslipFilters>({
        status: "",
        department: "",
        employee: "",
        period: "",
    });

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"generate" | "bulk" | "edit">("generate");
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    
    // Viewer states
    const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
    const [viewerPayslip, setViewerPayslip] = useState<Payslip | null>(null);

    const statusOptions = [
        { value: 1, label: "Draft", color: "gray" },
        { value: 2, label: "Generated", color: "blue" },
        { value: 3, label: "Approved", color: "green" },
        { value: 4, label: "Paid", color: "purple" },
        { value: 5, label: "Cancelled", color: "red" },
    ];

    const fetchPayslips = async () => {
        setLoading(true);
        try {
            const response = await api.get("payroll/payslips/");
            setPayslips(response.data);
            setFilteredPayslips(response.data);
        } catch (error) {
            console.error("Error fetching payslips:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await api.get("payroll/employees/");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        fetchPayslips();
        fetchEmployees();
    }, []);

    useEffect(() => {
        let filtered = payslips.filter((payslip) => {
            const employeeName = `${payslip.employee.user.first_name} ${payslip.employee.user.last_name}`.toLowerCase();
            const matchesSearch =
                employeeName.includes(searchTerm.toLowerCase()) ||
                payslip.employee.department
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                !filters.status || payslip.status.toString() === filters.status;
            const matchesDepartment =
                !filters.department || payslip.employee.department === filters.department;
            const matchesEmployee =
                !filters.employee || payslip.employee.id.toString() === filters.employee;

            // Period filter (assuming format YYYY-MM)
            const matchesPeriod = !filters.period || 
                payslip.start_date.startsWith(filters.period);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDepartment &&
                matchesEmployee &&
                matchesPeriod
            );
        });

        setFilteredPayslips(filtered);
        setCurrentPage(1);
    }, [searchTerm, filters, payslips]);

    const totalPages = Math.ceil(filteredPayslips.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPayslips = filteredPayslips.slice(startIndex, endIndex);

    const handleGeneratePayslip = () => {
        setModalMode("generate");
        setSelectedPayslip(null);
        setIsModalOpen(true);
    };

    const handleBulkGenerate = () => {
        setModalMode("bulk");
        setSelectedPayslip(null);
        setIsModalOpen(true);
    };

    const handleEditPayslip = (payslip: Payslip) => {
        setModalMode("edit");
        setSelectedPayslip(payslip);
        setIsModalOpen(true);
    };

    const handleViewPayslip = (payslip: Payslip) => {
        if (!payslip || !payslip.employee) {
            console.error("Cannot view payslip: Invalid payslip data", payslip);
            alert("Error: Invalid payslip data. Please refresh the page and try again.");
            return;
        }
        
        setViewerPayslip(payslip);
        setIsViewerOpen(true);
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
        setViewerPayslip(null);
    };

    const handleDownloadPDF = (pdfData: { payslip: Payslip; allowances: any[]; deductions: any[]; leaves: any[] }) => {
        // Validate the data before passing to PDF generator
        if (!pdfData || !pdfData.payslip || !pdfData.allowances || !pdfData.deductions || !pdfData.leaves) {
            console.error("Invalid PDF data:", pdfData);
            alert("Error: Invalid payslip data. Please try again.");
            return;
        }

        if (!pdfData.payslip.employee) {
            console.error("Missing employee data in payslip:", pdfData.payslip);
            alert("Error: Employee information is missing. Please refresh and try again.");
            return;
        }

        downloadPayslipPDF(pdfData);
    };

    const handleDeletePayslip = async (payslip: Payslip) => {
        if (
            window.confirm(
                `Are you sure you want to delete payslip for ${payslip.employee.user.first_name} ${payslip.employee.user.last_name}?`
            )
        ) {
            try {
                await api.delete(`payroll/payslips/${payslip.id}/`);
                fetchPayslips();
                console.log("Payslip deleted successfully");
            } catch (error) {
                console.error("Error deleting payslip:", error);
            }
        }
    };

    const handleUpdateStatus = async (payslip: Payslip, newStatus: number) => {
        try {
            await api.patch(`payroll/payslips/${payslip.id}/`, {
                status: newStatus,
                ...(newStatus === 3 && { approved_at: new Date().toISOString() })
            });
            fetchPayslips();
            console.log("Payslip status updated successfully");
        } catch (error) {
            console.error("Error updating payslip status:", error);
        }
    };

    const handleModalSubmit = async (data: PayslipFormData | BulkPayslipFormData) => {
        try {
            if (modalMode === "generate" && "employee_ids" in data) {
                // Generate payslips for selected employees
                const payslipData = {
                    employee_ids: data.employee_ids,
                    start_date: data.start_date,
                    end_date: data.end_date,
                    total_working_days: data.total_working_days,
                    auto_calculate_attendance: data.auto_calculate_attendance || false,
                    pay_frequency: data.pay_frequency,
                };

                await api.post("payroll/payslips/generate/", payslipData);
                console.log("Payslips generated successfully");
            } else if (modalMode === "bulk") {
                // Bulk generate payslips
                const bulkData = {
                    start_date: data.start_date,
                    end_date: data.end_date,
                    total_working_days: data.total_working_days,
                    auto_calculate_attendance: data.auto_calculate_attendance || false,
                    ...("employee_ids" in data && data.employee_ids && { employee_ids: data.employee_ids }),
                };

                await api.post("payroll/payslips/bulk-generate/", bulkData);
                console.log("Bulk payslips generated successfully");
            } else if (modalMode === "edit" && selectedPayslip) {
                // Update existing payslip
                const updateData = {
                    total_working_days: data.total_working_days,
                    start_date: data.start_date,
                    end_date: data.end_date,
                };

                await api.patch(`payroll/payslips/${selectedPayslip.id}/`, updateData);
                console.log("Payslip updated successfully");
            }

            fetchPayslips();
        } catch (error) {
            console.error("Error processing payslip:", error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPayslip(null);
        setModalMode("generate");
    };

    const handleExport = () => {
        console.log("Export payslips");
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
        <PayslipHeader
            onGeneratePayslip={handleGeneratePayslip}
            onBulkGenerate={handleBulkGenerate}
            onExport={handleExport}
        />
    );

    return (
        <Layout
            headerTitle="Payslips"
            headerRightContent={headerRightContent}
        >
            <PayslipModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleModalSubmit}
                payslip={selectedPayslip}
                employees={employees}
                mode={modalMode}
            />

            <PayslipViewer
                payslip={viewerPayslip!}
                isOpen={isViewerOpen}
                onClose={handleCloseViewer}
                onDownloadPDF={handleDownloadPDF}
            />

            <div className="p-6">
                {/* <PayslipStatsCards payslips={payslips} /> */}

                <PayslipSearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filters}
                    onFiltersChange={setFilters}
                    employees={employees}
                    payslips={payslips}
                    showFilters={showFilters}
                    onToggleFilters={setShowFilters}
                />

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <PayslipTable
                        payslips={currentPayslips}
                        loading={loading}
                        onViewPayslip={handleViewPayslip}
                        onEditPayslip={handleEditPayslip}
                        onDeletePayslip={handleDeletePayslip}
                        onUpdateStatus={handleUpdateStatus}
                        statusOptions={statusOptions}
                    />

                    {!loading && (
                        <PayslipPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            totalItems={filteredPayslips.length}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PayslipPage;