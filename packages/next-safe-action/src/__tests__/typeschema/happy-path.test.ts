/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from "node:assert";
import { test } from "node:test";
import { z } from "zod";
import { createSafeActionClient } from "../../typeschema";

const ac = createSafeActionClient();

test("typeschema - action with no input schema returns empty object", async () => {
	const action = ac.action(async () => {
		return;
	});

	const actualResult = await action();
	const expectedResult = {};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with no input schema and return data gives back an object with correct `data`", async () => {
	const action = ac.action(async () => {
		return {
			ok: true,
		};
	});

	const actualResult = await action();
	const expectedResult = {
		data: {
			ok: true,
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with input schema and return data gives back an object with correct `data`", async () => {
	const userId = "ed6f5b84-6bca-4d01-9a51-c3d0c49a7996";

	const action = ac.schema(z.object({ userId: z.string().uuid() })).action(async ({ parsedInput }) => {
		return {
			userId: parsedInput.userId,
		};
	});

	const actualResult = await action({ userId });

	const expectedResult = {
		data: {
			userId,
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with input schema passed via async function and return data gives back an object with correct `data`", async () => {
	const userId = "ed6f5b84-6bca-4d01-9a51-c3d0c49a7996";

	const action = ac
		.schema(async () => z.object({ userId: z.string().uuid() }))
		.action(async ({ parsedInput }) => {
			return {
				userId: parsedInput.userId,
			};
		});

	const actualResult = await action({ userId });

	const expectedResult = {
		data: {
			userId,
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with no input schema, bind args input schemas and return data gives back an object with correct `data`", async () => {
	const username = "johndoe";
	const age = 30;

	const action = ac
		.bindArgsSchemas<[username: z.ZodString, age: z.ZodNumber]>([z.string(), z.number()])
		.action(async ({ bindArgsParsedInputs: [username, age] }) => {
			return {
				username,
				age,
			};
		});

	const actualResult = await action(username, age);

	const expectedResult = {
		data: {
			username,
			age,
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with input schema, bind args input schemas and return data gives back an object with correct `data`", async () => {
	const userId = "ed6f5b84-6bca-4d01-9a51-c3d0c49a7996";
	const username = "johndoe";
	const age = 30;

	const action = ac
		.schema(z.object({ userId: z.string().uuid() }))
		.bindArgsSchemas<[username: z.ZodString, age: z.ZodNumber]>([z.string(), z.number()])
		.action(async ({ parsedInput, bindArgsParsedInputs: [username, age] }) => {
			return {
				userId: parsedInput.userId,
				username,
				age,
			};
		});

	const actualResult = await action(username, age, { userId });

	const expectedResult = {
		data: {
			username,
			age,
			userId,
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});
