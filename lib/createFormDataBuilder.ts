import { FormDataBuilder } from './FormDataBuilder';
import type { AnyObject } from './types';

/**
 * Creates a new instance of the FormDataBuilder class.
 *
 * @param {FormData} formData - The initial FormData object to be wrapped by the FormDataBuilder.
 * @return {FormDataBuilder<T>} - The new instance of the FormDataBuilder class.
 */
export function createFormDataBuilder<T extends AnyObject>(
	formData: FormData,
): FormDataBuilder<T> {
	return new FormDataBuilder<T>(formData) as FormDataBuilder<T>;
}
