import { beforeEach, describe, expect, it } from 'bun:test';
import { type Input, array, object, optional, string } from 'valibot';
import { createFormDataBuilder } from './';
import { FormDataBuilder } from './FormDataBuilder';
import { InvalidKey } from './errors';

const schema = object({
	title: string(),
	slug: optional(string()),
	categories: array(string()),
});

type SchemaType = Input<typeof schema>;

describe('FormDataBuilder single()', () => {
	let formData: FormData;
	let builder: FormDataBuilder<SchemaType>;

	beforeEach(() => {
		formData = new FormData();
		formData.append('title', 'title');
		formData.append('categories', 'Web');
		formData.append('categories', 'React');
	});

	it('should return transformed and validated data when using valid key', () => {
		builder = createFormDataBuilder(formData);

		const result = builder
			.single('title', { transform: (v) => `modified ${v}`, schema: string() })
			.build();

		expect(result).toEqual({
			title: 'modified title',
			categories: ['Web', 'React'],
		});
	});

	it('should skip transformation when encountering invalid and non-required key', () => {
		builder = createFormDataBuilder(formData);

		const result = builder
			// @ts-expect-error
			.single('invalidKey')
			.build();

		expect(result).toEqual({
			title: 'title',
			categories: ['Web', 'React'],
		});
	});

	it('should throw InvalidKey error when encountering invalid and required key', () => {
		builder = createFormDataBuilder(formData);

		expect(() =>
			builder
				// @ts-expect-error
				.single('invalidKey', { required: true })
				.build(),
		).toThrow(new InvalidKey('invalidKey'));
	});
});
