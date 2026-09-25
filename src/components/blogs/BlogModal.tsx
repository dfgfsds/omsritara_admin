import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { postBlogsApi, putBlogsApi } from "../../Api-Service/Apis";
import Input from "../Input";
import SingleImageUpload from "../products/SingleImageUpload";
import { useParams } from "react-router-dom";
import { InvalidateQueryFilters, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function BlogModal({ open, close, userId, editData }: any) {
    if (!open) return null;
    const [apiError, setApiError] = useState("");
    const [images, setImages] = useState<any[]>([]);
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const blogSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        subtitle: Yup.string().required("Subtitle is required"),
        description: Yup.string().required("Description is required"),
        content: Yup.string().required("Content is required"),
        author: Yup.string().required("Author is required"),
        meta_title: Yup.string().nullable(),
        meta_description: Yup.string().nullable(),
        canonical_tag: Yup.string().nullable(),
        robots_tag: Yup.string().nullable(),
        url_description: Yup.string().nullable(),
        url_slug: Yup.string().nullable(),
        og_tags: Yup.string().nullable(),
        twitter_tags: Yup.string().nullable(),
        image_src_tags: Yup.string().nullable(),
        schema: Yup.string().nullable(),
    });
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors },
    } = useForm({ resolver: yupResolver(blogSchema) });

    useEffect(() => {
        if (editData) {
            setValue("title", editData?.title || "");
            setValue("subtitle", editData?.subtitle || "");
            setValue("description", editData?.description || "");
            setValue("content", editData?.content || "");
            setValue("author", editData?.author || "");
            setValue("meta_title", editData?.meta_title || "");
            setValue("meta_description", editData?.meta_description || "");
            setValue("canonical_tag", editData?.canonical_tag || "");
            setValue("robots_tag", editData?.robots_tag || "");
            setValue("url_description", editData?.url_description || "");
            setValue("url_slug", editData?.url_slug || "");
            setValue("og_tags", editData?.og_tags ? (typeof editData.og_tags === 'object' ? JSON.stringify(editData.og_tags) : editData.og_tags) : "");
            setValue("twitter_tags", editData?.twitter_tags ? (typeof editData.twitter_tags === 'object' ? JSON.stringify(editData.twitter_tags) : editData.twitter_tags) : "");
            setValue("image_src_tags", editData?.image_src_tags ? (typeof editData.image_src_tags === 'object' ? JSON.stringify(editData.image_src_tags) : editData.image_src_tags) : "");
            setValue("schema", editData?.schema ? (typeof editData.schema === 'object' ? JSON.stringify(editData.schema) : editData.schema) : "");

            if (editData?.banner_url) {
                setImages([{ url: editData?.banner_url }]);
            } else {
                setImages([]);
            }
        } else {
            reset({
                title: "",
                subtitle: "",
                description: "",
                content: "",
                author: "",
                meta_title: "",
                meta_description: "",
                canonical_tag: "",
                robots_tag: "",
                url_description: "",
                url_slug: "",
                og_tags: "",
                twitter_tags: "",
                image_src_tags: "",
                schema: ""
            });
            setImages([]);
        }
    }, [editData, setValue, reset]);

    const onSubmit = async (data: any) => {
        delete data?.banner_url;
        try {
            setApiError("");
            
            const parseJsonSafely = (val: any) => {
                if (!val) return {};
                if (typeof val === 'object') return val;
                try {
                    return JSON.parse(val);
                } catch (e) {
                    return {};
                }
            };

            const payload = {
                ...data,
                og_tags: parseJsonSafely(data.og_tags),
                twitter_tags: parseJsonSafely(data.twitter_tags),
                image_src_tags: parseJsonSafely(data.image_src_tags),
                schema: parseJsonSafely(data.schema),
                banner_url: images[0]?.url || "",
                vendor: id,
                user: userId,
                likes: 0,
            };
            if (editData) {
                const updateApi = await putBlogsApi(`${editData?.id}/`, {
                    ...payload,
                    updated_by: `Vendor${id}`,
                });
                if (updateApi) {
                    reset();
                    close();
                    setImages([]);
                    queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
                }
            } else {
                const updateApi = await postBlogsApi('', {
                    ...payload,
                    created_by: `Vendor${id}`,
                });
                if (updateApi) {
                    reset();
                    close();
                    setImages([]);
                    queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
                }
            }
        } catch (err: any) {
            setApiError(err?.response?.data?.message || "Failed to create blog. Please try again.");
        }
    };


    return (
        <>
            <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
                <div className="bg-white p-6 rounded-md w-full max-w-lg max-h-[96vh] overflow-y-auto"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    <h3 className="text-lg font-semibold mb-4">
                        {editData ? "Edit Blog" : "Add New Blog"}
                    </h3>


                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="pt-2">
                            <h4 className="text-md font-semibold mb-3">General Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input label='Title' {...register("title")} className="input" />
                                    <p className="text-red-500 text-sm">{errors.title?.message}</p>
                                </div>

                                <div>
                                    <Input label='Subtitle' {...register("subtitle")} className="input" />
                                    <p className="text-red-500 text-sm">{errors.subtitle?.message}</p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea {...register("description")}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        rows={3}
                                    />
                                    <p className="text-red-500 text-sm">{errors.description?.message}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-md font-semibold mb-3">Content & Media</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Content
                                    </label>
                                    <Controller
                                        name="content"
                                        control={control}
                                        render={({ field }) => (
                                            <ReactQuill
                                                theme="snow"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <p className="text-red-500 text-sm mt-1">{errors.content?.message}</p>
                                </div>

                                <div>
                                    <Input label='Author' {...register("author")} className="input" />
                                    <p className="text-red-500 text-sm">{errors.author?.message}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-md font-semibold mb-3">SEO & Metadata</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <Input label='Meta Title' {...register("meta_title")} className="input" />
                                </div>
                                <div>
                                    <Input label='URL Slug' {...register("url_slug")} className="input" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                                    <textarea {...register("meta_description")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" rows={3} />
                                </div>
                                <div>
                                    <Input label='Canonical Tag' {...register("canonical_tag")} className="input" />
                                </div>
                                <div>
                                    <Input label='Robots Tag' {...register("robots_tag")} className="input" />
                                </div>
                                <div className="md:col-span-2">
                                    <Input label='URL Description' {...register("url_description")} className="input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">OG Tags (JSON)</label>
                                    <textarea {...register("og_tags")} placeholder="{}" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Twitter Tags (JSON)</label>
                                    <textarea {...register("twitter_tags")} placeholder="{}" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Image SRC Tags (JSON)</label>
                                    <textarea {...register("image_src_tags")} placeholder="{}" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Schema (JSON)</label>
                                    <textarea {...register("schema")} placeholder="{}" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" rows={4} />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Banner Image
                            </label>
                            <SingleImageUpload images={images} onChange={setImages} />
                        </div>



                        {apiError && <p className="text-red-600">{apiError}</p>}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                onClick={() => {
                                    close()
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#A12B1A] text-white rounded hover:bg-[#A12B1A]"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default BlogModal;