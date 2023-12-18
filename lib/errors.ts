export class InvalidKey extends Error {
	constructor(key: string) {
		super(`The key ${key as string} does not exist in the formData`);
		this.name = 'RequiredOperation';
		Object.setPrototypeOf(this, InvalidKey.prototype);
	}
}
