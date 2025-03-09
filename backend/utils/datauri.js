import path from "path";

const getDataUri = (file) => {
    if (!file || !file.originalname || !file.buffer) {
        throw new Error("Invalid file object");
    }

    const extName = path.extname(file.originalname).toString().toLowerCase();

    const base64Data = file.buffer.toString("base64");

    const dataUri = `data:${file.mimetype};base64,${base64Data}`;

    return dataUri;
};

export default getDataUri;