import cloudinary from "./cloudinary.js";


export function buildImageUrls(publicId) {

  return {

    original: cloudinary.url(publicId, {
      secure: true
    }),

    preview: cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { transformation:"preview_watermark" }
      ]
    }),

    thumb: cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { width: 400, crop: "fill", quality: "auto", fetch_format: "auto" }
      ]
    })

  };

}