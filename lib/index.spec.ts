import { beforeEach, describe, expect, it } from 'bun:test';
import { type Input, array, object, optional, string } from 'valibot';
import { FormDataBuilder } from './FormDataBuilder';
import { InvalidKey } from './errors';
import { createFormDataBuilder } from './index';

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

describe('FormDataBuilder array()', () => {
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
			.array('categories', {
				transform: (value) => value.map((v) => `modified ${v}`),
				schema: array(string()),
			})
			.build();

		expect(result).toEqual({
			title: 'title',
			categories: ['modified Web', 'modified React'],
		});
	});

	it('should skip transformation when encountering invalid and non-required key', () => {
		builder = createFormDataBuilder(formData);

		const result = builder
			// @ts-expect-error
			.array('invalidKey')
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
				.array('invalidKey', { required: true })
				.build(),
		).toThrow(new InvalidKey('invalidKey'));
	});
});

describe('FormDataBuilder transfer()', () => {
	let formData: FormData;
	let builder: FormDataBuilder<SchemaType>;

	beforeEach(() => {
		formData = new FormData();
		formData.append('title', 'title');
		formData.append('categories', 'Web');
		formData.append('categories', 'React');
	});

	it('should transfer a transformed and validated data when using valid key', () => {
		builder = createFormDataBuilder(formData);

		const result = builder
			.transfer('title', 'slug', {
				transform: (value) => `modified-${value}`,
				schema: string(),
			})
			.build();

		expect(result).toEqual({
			title: 'title',
			slug: 'modified-title',
			categories: ['Web', 'React'],
		});
	});

	it('should skip transformation when encountering invalid and non-required key', () => {
		builder = createFormDataBuilder(formData);

		const result = builder
			// @ts-expect-error
			.transfer('invalidKey', 'slug')
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
				.transfer('invalidKey', 'slug', { required: true })
				.build(),
		).toThrow(new InvalidKey('invalidKey'));
	});
});

describe('FormDataBuilder innerTransfer()', () => {
	let formData: FormData;
	let builder: FormDataBuilder<SchemaType>;

	beforeEach(() => {
		formData = new FormData();
		formData.append('title', 'title');
		formData.append('categories', 'Web');
		formData.append('categories', 'React');
	});

	it('should transfer previously transformed when using a valid key', () => {
		builder = createFormDataBuilder(formData);

		const result = builder
			.single('title', { transform: (v) => `modified ${v}`, schema: string() })
			.innerTransfer('title', 'slug', {
				transform: (value) => `${value}`.replaceAll(' ', '-'),
				schema: string(),
			})
			.build();

		expect(result).toEqual({
			title: 'modified title',
			slug: 'modified-title',
			categories: ['Web', 'React'],
		});
	});

	it('should skip transformation when encountering invalid and non-required key', () => {
		builder = createFormDataBuilder(formData);

		const result = builder
			.single('title', { transform: (v) => `modified ${v}`, schema: string() })
			// @ts-expect-error
			.innerTransfer('invalidKey', 'slug', {
				transform: (value) => `modified-${value}`,
				schema: string(),
			})
			.build();

		expect(result).toEqual({
			title: 'modified title',
			categories: ['Web', 'React'],
		});
	});

	it('should throw InvalidKey error when encountering invalid and required key', () => {
		builder = createFormDataBuilder(formData);

		expect(() =>
			builder
				.single('title', { transform: (v) => `modified ${v}`, schema: string() })
				// @ts-expect-error
				.innerTransfer('invalidKey', 'slug', {
					transform: (value) => `modified-${value}`,
					schema: string(),
					required: true,
				})
				.build(),
		).toThrow(new InvalidKey('invalidKey'));
	});
});
