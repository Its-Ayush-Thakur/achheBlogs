import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "../index";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues, formState: { errors } } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            Status: post?.Status || "active",
        },
    });

    const [error, setError] = useState('')
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        setError('')

        console.log(data, 41)
        if (post) {

            console.log(data, 42)
            const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

            if (file) {
                console.log(file, 45)
                appwriteService.deleteFile(post.featuredImg);
            }
            console.log(file, 99)
            console.log(post, 'post')
            const dbPost = await appwriteService.updatePost(post.$id, {
                ...data,
                featuredImg: file ? file.$id : undefined,
            });
            console.log(dbPost, 'img')
            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        } else {
            try {
                console.log('100')
                console.log(data, '100 ke bad')
                const file = await appwriteService.uploadFile(data.image[0]);
                console.log(file, 101)
                if (file) {
                    console.log(data, 102)
                    const fileId = file.$id;
                    data.featuredImg = fileId;
                    console.log(userData.$id, 999)
                    const dbPost = await appwriteService.createPost({ ...data, UseId: userData.$id, postedBy: userData.name });

                    console.log(dbPost, 105)
                    if (dbPost) {
                        navigate(`/post/${dbPost.$id}`);
                    }
                }
            } catch (error) {
                setError(error.message)
            }

        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: 'Title is required' })}
                />
                {errors.title && <p className="text-red-600">{errors.title.message}</p>}
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    readOnly={true}
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {errors.image && <p className="text-red-600">Featured Image is required</p>}
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.previewFile(post.featuredImg)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("Status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full" Children={post ? "Update" : "Submit"} />
            </div>
        </form>
    );
}