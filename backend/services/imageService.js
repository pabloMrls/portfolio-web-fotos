import cloudinary from "./cloudinary";

export function buildImageUrls (src) {
    const publicId = src.split("/upload/")[1].split(".")[0];

    return {
        original: cloudinary.url(publicId),
        preview: cloudinary.url(publicId, {
            transformation: [
                { quality : "40"},
                { overlay: "watermark", opacity: 50, gravity:"south_east"}
            ]
        }),
        thumb: cloudinary.url(publicId, {
            transformation: [
                {width: 400, crop: "fill"}
            ]
        })
    }
}