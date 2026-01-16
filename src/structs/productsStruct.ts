import { coerce, partial, object, string, min, nonempty, array, integer, Infer } from 'superstruct';
import { PageParamsStruct } from './commonStructs.js';

export const CreateProductBodyStruct = object({
  name: coerce(nonempty(string()), string(), (value) => value.trim()),
  description: nonempty(string()),
  price: min(integer(), 0),
  tags: array(nonempty(string())),
  images: array(nonempty(string())),
});

export const GetProductListParamsStruct = PageParamsStruct;

export const UpdateProductBodyStruct = partial(CreateProductBodyStruct);

// Inferred types
export type CreateProductBody = Infer<typeof CreateProductBodyStruct>;
export type UpdateProductBody = Infer<typeof UpdateProductBodyStruct>;
