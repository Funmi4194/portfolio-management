import * as response from '../garage/helper/response';
import Joi, { ObjectSchema } from 'joi';
import { MakeResponse } from '../types/generic';

export default function validate(
  schema: ObjectSchema<any>,
  payload: Record<string, any>
): MakeResponse {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,   // return all errors
    stripUnknown: true,  // remove fields not in schema
    convert: true        // cast values (string → number, etc.)
  });

  if (error) {
    return response.makeResponse(
      false,
      error.details.map(d => d.message.replace(/"/g, '')).join(', '),
      null,
      400
    );
  }

  return response.makeResponse(true, 'Validation successful', value, 200);
}