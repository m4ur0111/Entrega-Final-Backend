const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/documents');
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, Date.now() + extension);
    },
});

const uploadDocument = multer({ storage: storage }).array('documents', 5);

module.exports = uploadDocument;
