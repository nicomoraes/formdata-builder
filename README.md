# formdata-builder

A TypeScript utility class for constructing type-safe data from `formData`, designed for integration with Valibot.

## Installation

npm:

```bash
npm install formdata-builder valibot
```

pnpm:

```bash
pnpm add formdata-builder valibot
```

bun:

```bash
bun add formdata-builder valibot
```

## Usage

```typescript
import { createFormDataBuilder } from 'formdata-builder';
import { Input, array, minLength, object, string } from 'valibot';
import { slugify } from './utils'

/*
Create a object schema that includes:
 - data representing the data coming from formData
 - (optional) extra properties that will be created from the data coming from formData.
*/
export const schema = object({
  title: string([minLength(16, 'String length must be greater than 16')]),
  /* slug is a extre property*/
  slug: string(),
  frameworks: array(string()),
});

// Infer object input type
type SchemaType = Input<typeof schema>;

const formData = new FormData();
formData.append('title', 'Lorem Ipsum');
formData.append('frameworks', 'Next.js');
formData.append('frameworks', 'Svelte');

// Create a builder instance
const builder = createFormDataBuilder<SchemaType>(formData);

const data = builder
  // Transferring and transforming the value from 'title' to 'slug'
  .transfer('title', 'slug', { 
    // Apply transformations
    transform: (value) => slugify(value),
    // Apply the validation to transformed value
    schema: string() 
  })
  .array('frameworks', { 
  // Apply transformations to all 'frameworks' values
    transform: (value) => value.map(v => `modified ${v}`) 
  })
  // Returning all transformed and untransformed data
  .build();

/*
  result = { 
    title: "Lorem Ipsum", slug: "lorem-ipsum",
    frameworks: ["modified Next.js", "modified Svelte"]  
  }
*/
```
## Methods

All transformation methods (array, innerTransfer, single and transfer) have options, which represent an optional object that contains the following properties:
- transform: a function retrieves a value in FormData and allows its transformation. If not provided, the untransformed value will be inserted into the result object.
- schema: a valibot schema to validate the transformed value or the raw value.
- required: a boolean that indicates whether the transformation is mandatory.
  - `true`: If the specified key does not exist in FormData, an error will be generated.
  - `false`: in the absence of the key in FormData, the current function will be ignored.

### single(key, { transform?, schema?, required? })

The `single()` method is used to process and transform data from a formData that would normally be retrieved using `formData.get("someKey")`.

```typescript
import { createFormDataBuilder } from 'formdata-builder';
import { string } from 'valibot';

const formData = new FormData();
formData.append('title', 'Lorem Ipsum');

export const schema = object({
  title: string(),
});

const result = builder
  .single('title', { 
    transform: (value) => `new ${value}`,
    schema: string()
  })
  .build();

// result = { title: "new Lorem Ipsum" }
```

### array(key, { transform?, schema?, required? })

The `array` method is used to process and transform data from a formData that would normally be retrieved using `formData.getAll("someKey")`.

```typescript
import { createFormDataBuilder } from 'formdata-builder';
import { array, string } from 'valibot';

const formData = new FormData();
formData.append('frameworks', 'Next.js');
formData.append('frameworks', 'Svelte');

export const schema = object({
  frameworks: array(string()),
});

type SchemaType = Input<typeof schema>;

const builder = createFormDataBuilder<SchemaType>(formData);

const result = builder
  .array('frameworks', { 
    transform: (value) => value.map(v => `modified ${v}`),
    schema: array(string())
  })
  .build();

// result = { categories: ["modified Next.js", "modified Svelte"]  }
```

### transfer(from, to, { transform?, schema?, required? })

The `transfer()` method is used to transfer a value from a formData to another key. In the transfer process, this method also allows the transformation and validation of the value to be transferred.

```typescript
import { object, string } from 'valibot';

const formData = new FormData();
formData.append('title', 'Lorem Ipsum');

export const schema = object({
  title: string(),
  slug: string(),
});

type SchemaType = Input<typeof schema>;

const builder = createFormDataBuilder<SchemaType>(formData);


const data = builder
  .transfer('title', 'slug', { 
    transform: (value) => slugify(value),
    schema: string()
  })
  .build();

// => {title: 'Lorem Ipsum', slug: 'lorem-ipsum'}
```

### innerTransfer(from, to, { transform?, schema?, required? })

The `innerTransfer()` method is used to transfer a previously transformed value to another specified key. In the transfer process, this method also allows the transformation and validation of the value to be transferred.

```typescript
import { object, string } from 'valibot';

const formData = new FormData();
formData.append('title', 'Lorem Ipsum');

export const schema = object({
  title: string(),
  slug: string(),
});

type SchemaType = Input<typeof schema>;

const builder = createFormDataBuilder<SchemaType>(formData);

const data = builder
  single('title', {
    transform: (value) => `Modified ${value}`
  })
  .innerTransfer('title', 'slug', { 
    transform: (value) => value.replaceAll(" ", "-"),
    schama: string()
  })
  .build();

// => {title: 'Modified Lorem Ipsum', slug: 'modified-lorem-ipsum'}
```

### build(schema?)

The `build()` method will return the transformed data and those that were not transformed into a single object.
```typescript
// Without schema
const data = builder.build();

// Wtih schema
const data = builder.build(schema);
```

## Contributing

If you want to contribute to formdata-builder, the best way is to fork this repository and [open a pull request](https://github.com/nicomoraes/formdata-builder/pulls) when you're done implementing your feature.

If you find bugs or just want to ask a question, feel free to [open an issue](https://github.com/nicomoraes/formdata-builder/issues).

## License

formdata-builder is released under the MIT license.