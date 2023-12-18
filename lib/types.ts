import type { BaseSchema } from 'valibot';

/**
 * Represents a generic object where keys are strings
 * and values can be of any type.
 */
export type AnyObject = {
	[key: string]: unknown;
};

export type KeysWithArrays<T> = {
	[K in keyof T]: T[K] extends unknown[] ? K : never;
}[keyof T];

/**
 * Extracts keys from a type that do not have array values.
 */
export type KeysWithoutArrays<T> = {
	[K in keyof T]: T[K] extends unknown[] ? never : K;
}[keyof T];

/**
 * Represents the type of the element. If T is of type Blob, the resulting type is Blob; otherwise, it is string.
 */
export type ElementType<T> = T extends Blob ? Blob : string;

/**
 * Checks if type T is an array. If yes, the resulting type is true; otherwise, it is false.
 */
export type IsArray<T> = T extends Array<infer U> ? true : false;

/**
 * If T is an array, returns an array of type Blob[] if the internal element is Blob,
 * otherwise returns an array of strings. If T is not an array, the resulting type is never.
 */
export type ArrayType<T> = T extends (infer U)[]
	? U extends Blob
		? Blob[]
		: string[]
	: never;

/**
 * Represents a common set of generic options that can be applied to specific types.
 * @template T - The type of data to which the options apply.
 * @template K - The transformed type or an array of transformed types.
 * @template U - The key of the data type to which the options are being applied.
 */
export type CommonOptions<T, K, U extends keyof T> = {
	/**
	 * An optional base schema that can be provided for additional processing.
	 */
	schema?: BaseSchema;

	/**
	 * Defines a transformation function applicable to values retrieved from formData.
	 *
	 * @param value - The input value to be transformed.
	 *
	 * @returns The transformed value.
	 */
	transform?: (value: K) => NonNullable<T[U]>;

	/**
	 * Sets the current method with a required flag.
	 *
	 * When required is set to `true`: The absence of the key in the FormData will throw an error.
	 *
	 * When required is set to `false` (default): If the key entered in the FormData is missing, the current operation will be skipped without throwing an error. Otherwise, the operation will occur normally.
	 */
	required?: boolean;
};

export interface IFormDataBuilder<T extends { [key: string]: unknown }> {
	/**
	 * Retrieves a single value from the formData associated with the specified key,optionally processing the value based on provided options,
	 * and stores the result in the internal data object.
	 *
	 * @param key - The key used to retrieve the value from the FormData.
	 * @param {Object} [options] - Options for execution.
	 * @param {BaseSchema} [options.schema] - The schema to apply during data processing.
	 * @param {Function} [options.transform] - A function to apply data transformation.
	 * @param {boolean} [options.required] - Defines whether method execution should throw an error if the `key` is not in FormData.
	 *
	 * @returns {this} Returns the current instance for method chaining.
	 */
	single<K extends KeysWithoutArrays<T>>(
		key: K,
		options?: CommonOptions<T, ElementType<T[K]>, K>,
	): this;

	/**
	 * Retrieves an array value from the formData using the specified key, optionally processing the value based on provided options,
	 * and stores the result in the internal data object.
	 *
	 * @param key - A key that must have more than one record in formData.
	 * @param {Object} [options] - Options for execution.
	 * @param {BaseSchema} [options.schema] - The schema to apply during data processing.
	 * @param {Function} [options.transform] - A function to apply data transformation.
	 * @param {boolean} [options.required] - Defines whether method execution should throw an error if the `key` is not in FormData.
	 *
	 * @returns {this} Returns the current instance for method chaining.
	 */
	array<K extends KeysWithArrays<T>>(
		key: K,
		options?: CommonOptions<T, ArrayType<T[K]>, K>,
	): this;

	/**
	 * Transfers a value from one key to another, optionally processing the value based on provided options,
	 * and stores the result in the internal data object.
	 *
	 * @param {string} from - The key from which to transfer the value.
	 * @param {string} to - The key to which the value should be transferred.
	 * @param {Object} [options] - Options for execution.
	 * @param {BaseSchema} [options.schema] - The schema to apply during data processing.
	 * @param {Function} [options.transform] - A function to apply data transformation.
	 * @param {boolean} [options.required] - Defines whether method execution should throw an error if the `from` is not in FormData.
	 *
	 * @returns {this} Returns the current instance for method chaining.
	 *
	 */
	transfer<K extends keyof T, U extends keyof Omit<T, K>>(
		from: K,
		to: U,
		options?: CommonOptions<T, ArrayType<T[K]> | ElementType<T[K]>, U>,
	): this;

	/**
	 * Transfers a value from the key referencing previously transformed data to another specified key.
	 *
	 * @param {string} from - The key from which to transfer the value.
	 * @param {string} to - The key to which the value should be transferred.
	 * @param {Object} [options] - Options for execution.
	 * @param {BaseSchema} [options.schema] - The schema to apply during data processing.
	 * @param {Function} [options.transform] - A function to apply data transformation.
	 * @param {boolean} [options.required] - Defines whether method execution should throw an error if the `from` is not in internal data.
	 *
	 * @returns {this} Returns the current instance for method chaining.
	 */
	innerTransfer<K extends keyof T, U extends keyof Omit<T, K>>(
		from: K,
		to: U,
		options?: CommonOptions<T, T[K], U>,
	): this;
}
