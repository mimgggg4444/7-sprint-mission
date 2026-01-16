import { nonempty, object, partial, string, Infer } from 'superstruct';
import { CursorParamsStruct } from './commonStructs.js';

export const CreateCommentBodyStruct = object({
  content: nonempty(string()),
});

export const GetCommentListParamsStruct = CursorParamsStruct;

export const UpdateCommentBodyStruct = partial(CreateCommentBodyStruct);

// Inferred types
export type CreateCommentBody = Infer<typeof CreateCommentBodyStruct>;
export type UpdateCommentBody = Infer<typeof UpdateCommentBodyStruct>;
