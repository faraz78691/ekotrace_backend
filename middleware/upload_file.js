const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const originalName = path.parse(file.originalname).name.replace(/\s+/g, '_');
        const ext = path.extname(file.originalname);
        const randomSuffix = Math.random().toString(36).substring(2, 5);
        cb(null, `${originalName}_${randomSuffix}${ext}`);
    }
});

const fileFilter = function (req, file, cb) {
    const allowedTypes = [
        'image/png',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PNG, PDF, Excel, Word files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    // fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = upload;
