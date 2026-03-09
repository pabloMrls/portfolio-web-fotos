import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
  return {
    folder: "fotos",
    allowed_formats: ["jpg","jpeg","png","webp"],
    public_id: Date.now() + "-" + file.originalname.split(".")[0]
  };
}
});

export default storage;