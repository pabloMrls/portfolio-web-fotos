import cloudinary from "./cloudinary.js";

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
        {
          overlay: "logos:watermark_egtid7",
          gravity: "center",
          opacity: 70
        }
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
