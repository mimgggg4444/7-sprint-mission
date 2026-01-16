import { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PUBLIC_PATH, STATIC_PATH } from '../lib/constants.js';
import BadRequestError from '../lib/errors/BadRequestError.js';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export const upload = multer({
  storage: multer.diskStorage({
    destination(_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      cb(null, PUBLIC_PATH);
    },
    filename(_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  }),

  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },

  fileFilter: function (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      const err = new BadRequestError('Only png, jpeg, and jpg are allowed');
      return cb(err);
    }

    cb(null, true);
  },
});

export async function uploadImage(req: Request, res: Response): Promise<void> {
  const host = req.get('host');
  const filePath = path.join(host!, STATIC_PATH, req.file!.filename);
  const url = `http://${filePath}`;
  res.send({ url });
}
