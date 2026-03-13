import cloudinary from "./cloudinary.js";

export function buildImageUrls(publicId) {

  return {

    original: cloudinary.url(publicId, {
      secure: true
    }),

    preview: cloudinary.url(publicId, {
      secure: true,
      transformation: [
        { quality: "40" },
        { overlay: "logos:l_watermark_egtid7", opacity: 70, gravity: "center" }
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