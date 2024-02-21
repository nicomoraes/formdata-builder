export class FormDataKeyNotFoundError extends Error {
	constructor(key: string) {
		super(`The key ${key as string} does not exist in the FormData`);
		this.name = 'FormDataKeyNotFoundError';
		Object.setPrototypeOf(this, FormDataKeyNotFoundError.prototype);
	}
}

export class TransformedKeyNotFoundError extends Error {
	constructor(key: string) {
		super(`The key ${key as string} has not been transformed`);
		this.name = 'TransformedKeyNotFoundError';
		Object.setPrototypeOf(this, TransformedKeyNotFoundError.prototype);
	}
}
