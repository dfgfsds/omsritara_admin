import { InvalidateQueryFilters, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCourseLeadApi, getCourseLeadApi } from "../../Api-Service/Apis";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, Loader2, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import Search from '../../components/Search';
import { Pagination } from '../Pagination';
import EmptyBox from '../../assets/image/empty-box.png';
import { toast } from "react-toastify";

function CourseLead() {
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const queryClient = useQueryClient();

    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { data: getCourseLeadData, isLoading }: any = useQuery({
        queryKey: ['getCourseLeadApiData'],
        queryFn: () => getCourseLeadApi()
    });


    const handleDelete = async (id: number) => {
        setDeleteLoading(true);

        try {
            await deleteCourseLeadApi(`${id}`);

            queryClient.invalidateQueries({
                queryKey: ["getCourseLeadApiData"],
            });

            toast.success("Lead deleted successfully");

            setDeleteModal(false);
            setSelectedId(null);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.error ||
                "Something went wrong. Please try again!"
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredData = getCourseLeadData?.data?.data?.filter((item: any) => {
        const searchMatch =
            item?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            item?.email?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
            item?.phone_no?.includes(searchTerm) ||
            item?.course?.toLowerCase()?.includes(searchTerm.toLowerCase());

        const itemDate = new Date(item.date);

        const startMatch = startDate
            ? itemDate >= new Date(startDate)
            : true;

        const endMatch = endDate
            ? itemDate <= new Date(endDate + "T23:59:59")
            : true;

        return searchMatch && startMatch && endMatch;
    });

    const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);

    const paginatedItems = filteredData?.slice(
        (currentPage - 1) * itemsPerPage,
        (currentPage) * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate]);

    const handleDownloadExcel = () => {
        if (!filteredData?.length) {
            alert("No Leads Found");
            return;
        }

        const excelData = filteredData.map((item: any) => ({
            Name: item.name,
            Phone: item.phone_no,
            Email: item.email,
            Location: item.location,
            Course: item.course,
            Date: item.date,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Course Leads");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const data = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(data, "Course_Leads.xlsx");
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="px-4 sm:px-0">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Course Leads</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            View and manage your leads collected from website courses
                        </p>
                    </div>
                </div>

                {/* Filter and Search Actions Section */}
                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex flex-wrap flex-1 gap-3 items-center">
                        <div className="w-full md:max-w-sm">
                            <Search
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search Name, Email, Phone, Course..."
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 h-10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            />
                            <span className="text-gray-400 text-sm">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 h-10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="sm:flex-none">
                        <Button onClick={handleDownloadExcel} className='flex w-full md:w-auto justify-center'>
                            <Download className="h-4 w-4 mr-2 my-auto" />
                            Excel Download
                        </Button>
                    </div>
                </div>

                {/* Table Layout Render Logic */}
                {isLoading ? (
                    <div className="mt-8 flex flex-col">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle">
                                <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">S.No</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {[...Array(5)].map((_, index) => (
                                                <tr key={index}>
                                                    {Array.from({ length: 7 }).map((_, idx) => (
                                                        <td key={idx} className="px-6 py-4">
                                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {paginatedItems?.length ? (
                            <div className="mt-8 flex flex-col">
                                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="inline-block min-w-full py-2 align-middle">
                                        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                                            <table className="min-w-full divide-y divide-gray-300">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">S.No</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Course</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {paginatedItems?.map((item: any, index: number) => (
                                                        <tr key={index}>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{item?.name}</td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{item?.phone_no}</td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{item?.email}</td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{item?.location}</td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{item?.course}</td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{item?.date}</td>
                                                            <td className="whitespace-nowrap px-6 py-4">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedId(item?.id);
                                                                        setDeleteModal(true);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Structure */}
                                        <div className="flex justify-between mt-3 px-2">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                            />
                                            <select
                                                value={itemsPerPage}
                                                onChange={(e: any) => setItemsPerPage(Number(e.target.value))}
                                                className="border h-10 rounded px-2 py-1 text-sm !focus:outline-none !focus:ring-2 !focus:ring-blue-500"
                                            >
                                                <option value={10}>10 per page</option>
                                                <option value={25}>25 per page</option>
                                                <option value={50}>50 per page</option>
                                                <option value={100}>100 per page</option>
                                            </select>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="my-10">
                                <img className='size-60 mx-auto' src={EmptyBox} alt="No Leads" />
                                <div className='text-center text-[#1718FE] font-bold mt-2'>No Leads Found</div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {deleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[400px]">
                        <h2 className="text-xl font-semibold">
                            Delete Lead
                        </h2>

                        <p className="text-gray-600 mt-2">
                            Are you sure you want to delete this lead?
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setDeleteModal(false);
                                    setSelectedId(null);
                                }}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => handleDelete(selectedId!)}
                                disabled={deleteLoading}
                                className="bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseLead;