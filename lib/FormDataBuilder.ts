import { type BaseSchema, type Output, parse } from 'valibot';
import { InvalidKey } from './errors';
import type {
	AnyObject,
	CommonOptions,
	ElementType,
	IFormDataBuilder,
	KeysWithoutArrays,
} from './types';

export class FormDataBuilder<T extends AnyObject> implements IFormDataBuilder<T> {
	private formData: FormData;
	private internalData: T = {} as T;

	constructor(formData: FormData) {
		this.formData = formData;
	}

	single<K extends KeysWithoutArrays<T>>(
		key: K,
		options: CommonOptions<T, ElementType<T[K]>, K> = {
			required: false,
		},
	): this {
		if (!options.required) {
			if (!this.getFormDataKeys.includes(key as string)) {
				return this;
			}
		} else {
			if (!this.getFormDataKeys.includes(key as string)) {
				throw new InvalidKey(key as string);
			}
		}

		const value = this.formData.get(key as string) as ElementType<T[K]>;

		const output = this.runOptions<typeof value, K, T[K]>(value, options);

		this.internalData[key] = output;

		return this;
	}

	build<B extends BaseSchema | undefined>(
		schema?: B,
	): B extends BaseSchema ? Output<B> : T {
		const dataKeys = this.getInternalDataKeys;
		const formDataKeys = this.getFormDataKeys;

		if (formDataKeys.length > 0) {
			for (const key of formDataKeys) {
				const isNotIncludedInFormData = !dataKeys.includes(key);
				const isRepeatedFormDataKey = formDataKeys.filter((e) => key === e)?.length > 1;

				if (!isRepeatedFormDataKey && isNotIncludedInFormData) {
					// @ts-ignore
					this.internalData[key] = this.formData.get(key) as string | Blob;
				} else if (isRepeatedFormDataKey && isNotIncludedInFormData) {
					// @ts-ignore
					this.internalData[key] = this.formData
						.getAll(key)
						.filter((v) => v !== null && v !== '') as string[] | Blob[];
				}
			}
		}

		if (schema) {
			return parse(schema, this.internalData);
		}

		return this.internalData as B extends BaseSchema ? Output<B> : T;
	}

	private runOptions<K, U extends keyof T, R>(
		value: K,
		options?: CommonOptions<T, K, U>,
	): R {
		if (options) {
			if (options.schema) {
				return parse(
					options.schema,
					options.transform ? options.transform(value) : value,
				);
			}
			if (options.transform) {
				return options.transform(value) as unknown as R;
			}
		}
		return value as unknown as R;
	}

	private get getFormDataKeys() {
		return Array.from(this.formData.keys());
	}

	private get getInternalDataKeys() {
		return Object.keys(this.internalData);
	}
}
