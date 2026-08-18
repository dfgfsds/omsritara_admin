import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProductVariantSizeApi, getVendorNotificationsApi, postVendorNotificationApi } from '../../Api-Service/Apis';
import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import Button from '../../components/Button';
import axios from 'axios';
import { baseUrl } from '../../Api-Service/ApiUrls';

interface Props { }

function Notifications(props: Props) {
    const { } = props;
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        vendor_id: id || '',
        notification_type: '',
        title: '',
        message: '',
        redirect_type: '',
        redirect_value: '',
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');

    // ✅ Fetch Categories
    const getCategoriesData = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/main-categories/${id}`);
            setCategories(res?.data || []);
        } catch (error: any) {
            console.log(error?.response?.data?.message || 'Something went wrong!');
        }
    };

    useEffect(() => {
        getCategoriesData();
    }, []);

    // ✅ Fetch Products using React Query
    const { data: productData, isLoading: productDataLoading }: any = useQuery({
        queryKey: ['getAllProductVariantSizeData', id],
        queryFn: () => getAllProductVariantSizeApi(`?vendor_id=${id}`)
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['vendorNotifications', id],
        queryFn: () => getVendorNotificationsApi(id),
        enabled: Boolean(id),
    });

    const createNotificationMutation = useMutation({
        mutationFn: postVendorNotificationApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorNotifications', id] });
            setForm({
                vendor_id: id || '',
                notification_type: '',
                title: '',
                message: '',
                redirect_type: '',
                redirect_value: '',
            });
            setSelectedFile(null);
            setIsModalOpen(false);
        },
    });

    const notifications = data?.data?.data || [];

    const formatDate = (value?: string) => {
        if (!value) return '—';
        return new Date(value).toLocaleString();
    };

    const getStatusClasses = (status?: string) => {
        const normalized = (status || '').toUpperCase();
        if (normalized === 'COMPLETED') return 'bg-green-100 text-green-700';
        if (normalized === 'PENDING') return 'bg-yellow-100 text-yellow-700';
        if (normalized === 'FAILED') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append('vendor_id', String(id || form.vendor_id));
        payload.append('notification_type', form.notification_type);
        payload.append('title', form.title);
        payload.append('message', form.message);
        payload.append('redirect_type', form.redirect_type);
        payload.append('redirect_value', form.redirect_value);

        if (selectedFile) {
            payload.append('image_url', selectedFile);
        }

        createNotificationMutation.mutate(payload);
    };

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        View recent bulk notification history for this store.
                    </p>
                </div>
                <Button
                    className='flex'
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                // className="mt-4 inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:mt-0"
                >
                    <Plus className="h-4 w-4 mr-2 my-auto" />
                    Add Notification
                </Button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Send New Notification</h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Notification Type</label>
                                <select
                                    value={form.notification_type}
                                    onChange={(e) => setForm({ ...form, notification_type: e.target.value })}
                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select notification type</option>
                                    <option value="ORDER_STATUS">Order Status</option>
                                    <option value="PROMOTION">Promotion</option>
                                    <option value="SYSTEM">System</option>
                                    <option value="REMINDER">Reminder</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Enter title"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">Redirect Type</label>
                                <select
                                    value={form.redirect_type}
                                    onChange={(e) => {
                                        setForm({
                                            ...form,
                                            redirect_type: e.target.value,
                                            redirect_value: '',
                                        });
                                    }}
                                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">Select redirect type</option>
                                    <option value="CATEGORY">CATEGORY</option>
                                    <option value="PRODUCT">PRODUCT</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Redirect Value</label>
                                {form.redirect_type === 'CATEGORY' ? (
                                    <select
                                        value={form.redirect_value}
                                        onChange={(e) => setForm({ ...form, redirect_value: e.target.value })}
                                        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : form.redirect_type === 'PRODUCT' ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={productSearchTerm}
                                            onChange={(e) => setProductSearchTerm(e.target.value)}
                                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                            placeholder="Search products"
                                        />
                                        <select
                                            value={form.redirect_value}
                                            onChange={(e) => setForm({ ...form, redirect_value: e.target.value })}
                                            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Select product</option>
                                            {productData?.data
                                                ?.filter((product: any) =>
                                                    product?.name?.toLowerCase().includes(productSearchTerm.toLowerCase())
                                                )
                                                .map((product: any) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                ) : (
                                    <input
                                        value={form.redirect_value}
                                        onChange={(e) => setForm({ ...form, redirect_value: e.target.value })}
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                        placeholder="Select redirect type first"
                                        disabled
                                        required
                                    />
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                    rows={4}
                                    placeholder="Enter notification message"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Image File (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="md:col-span-2 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                // className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createNotificationMutation.isPending}
                                // className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                >
                                    {createNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
                                </Button>
                            </div>
                            {createNotificationMutation.isError && (
                                <div className="md:col-span-2 text-sm text-red-600">
                                    Failed to send notification.
                                </div>
                            )}
                            {createNotificationMutation.isSuccess && (
                                <div className="md:col-span-2 text-sm text-green-600">
                                    Notification sent successfully.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Image</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Recipients</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Success</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Failed</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                                        Loading notifications...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-red-500">
                                        Failed to load notifications.
                                    </td>
                                </tr>
                            ) : notifications.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                                        No notification history found.
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title || 'Notification image'}
                                                    className="h-14 w-14 rounded object-cover"
                                                />
                                            ) : (
                                                <span className="text-gray-400">No image</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div className="font-medium">{item.title || 'Untitled'}</div>
                                            <div className="text-xs text-gray-500">{item.message || '—'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.notification_type || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.active_user_count ?? 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.success_count ?? 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{item.failed_count ?? 0}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(item.status)}`}>
                                                {item.status || 'UNKNOWN'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.created_at)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Notifications;
