/* eslint-disable @typescript-eslint/no-floating-promises */

import assert from "node:assert";
import { test } from "node:test";
import { z } from "zod";
import {
	createSafeActionClient,
	flattenValidationErrors,
	formatValidationErrors,
	returnValidationErrors,
} from "../../typeschema";

// Default client tests.

const dac = createSafeActionClient();

test("typeschema - action with invalid input gives back an object with correct `validationErrors` (default formatted shape)", async () => {
	const schema = z.object({
		user: z.object({
			id: z.string().min(36).uuid(),
		}),
		store: z.object({
			id: z.string().min(36).uuid(),
			product: z.object({
				id: z.string().min(36).uuid(),
			}),
		}),
	});

	const action = dac.schema(schema).action(async () => {
		return {
			ok: true,
		};
	});

	const actualResult = await action({
		user: {
			id: "invalid_uuid",
		},
		store: {
			id: "invalid_uuid",
			product: {
				id: "invalid_uuid",
			},
		},
	});

	const expectedResult = {
		validationErrors: {
			user: {
				id: {
					_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
				},
			},
			store: {
				id: {
					_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
				},
				product: {
					id: {
						_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
					},
				},
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with root level schema error gives back an object with correct `validationErrors` (default formatted shape)", async () => {
	const userId = "invalid_uuid";

	// Test with async function that returns the schema.
	async function getSchema() {
		return z
			.object({
				userId: z.string().min(36).uuid(),
				password: z.string(),
				confirmPassword: z.string(),
			})
			.refine((d) => d.password === d.confirmPassword, {
				message: "Passwords do not match",
			});
	}

	const action = dac.schema(getSchema).action(async () => {
		return {
			ok: true,
		};
	});

	const actualResult = await action({
		userId,
		password: "test123",
		confirmPassword: "test456",
	});

	const expectedResult = {
		validationErrors: {
			_errors: ["Passwords do not match"],
			userId: {
				_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with invalid input gives back an object with correct `validationErrors` (default formatted shape overridden by custom flattened shape)", async () => {
	const schema = z
		.object({
			userId: z.string().min(36).uuid(),
			storeId: z.string().min(36).uuid(),
		})
		.refine((d) => d.userId !== d.storeId, {
			message: "User id and store id cannot be the same",
		});

	const action = dac
		.schema(schema, {
			handleValidationErrorsShape: flattenValidationErrors,
		})
		.action(async () => {
			return {
				ok: true,
			};
		});

	const actualResult = await action({
		userId: "invalid_uuid",
		storeId: "invalid_uuid",
	});

	const expectedResult = {
		validationErrors: {
			formErrors: ["User id and store id cannot be the same"],
			fieldErrors: {
				userId: ["String must contain at least 36 character(s)", "Invalid uuid"],
				storeId: ["String must contain at least 36 character(s)", "Invalid uuid"],
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

// Formatted shape tests (same as default).

const foac = createSafeActionClient({
	defaultValidationErrorsShape: "formatted",
});

test("typeschema - action with invalid input gives back an object with correct `validationErrors` (set formatted shape)", async () => {
	const schema = z.object({
		user: z.object({
			id: z.string().min(36).uuid(),
		}),
		store: z.object({
			id: z.string().min(36).uuid(),
			product: z.object({
				id: z.string().min(36).uuid(),
			}),
		}),
	});

	const action = foac.schema(schema).action(async () => {
		return {
			ok: true,
		};
	});

	const actualResult = await action({
		user: {
			id: "invalid_uuid",
		},
		store: {
			id: "invalid_uuid",
			product: {
				id: "invalid_uuid",
			},
		},
	});

	const expectedResult = {
		validationErrors: {
			user: {
				id: {
					_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
				},
			},
			store: {
				id: {
					_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
				},
				product: {
					id: {
						_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
					},
				},
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with root level schema error gives back an object with correct `validationErrors` (set formatted shape)", async () => {
	const userId = "invalid_uuid";

	const schema = z
		.object({
			userId: z.string().uuid(),
			password: z.string(),
			confirmPassword: z.string(),
		})
		.refine((d) => d.password === d.confirmPassword, {
			message: "Passwords do not match",
		})
		.refine((d) => d.userId === "488d92e3-d394-4db8-b7c0-7b38c85280c1", {
			message: "UUID mismatch",
		});

	const action = foac.schema(schema).action(async () => {
		return {
			ok: true,
		};
	});

	const actualResult = await action({
		userId,
		password: "test123",
		confirmPassword: "test456",
	});

	const expectedResult = {
		validationErrors: {
			_errors: ["Passwords do not match", "UUID mismatch"],
			userId: {
				_errors: ["Invalid uuid"],
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with invalid input gives back an object with correct `validationErrors` (set formatted shape overridden by custom flattened shape)", async () => {
	const schema = z
		.object({
			userId: z.string().min(36).uuid(),
			storeId: z.string().min(36).uuid(),
		})
		.refine((d) => d.userId !== d.storeId, {
			message: "User id and store id cannot be the same",
		});

	const action = foac
		.schema(schema, {
			handleValidationErrorsShape: flattenValidationErrors,
		})
		.action(async () => {
			return {
				ok: true,
			};
		});

	const actualResult = await action({
		userId: "invalid_uuid",
		storeId: "invalid_uuid",
	});

	const expectedResult = {
		validationErrors: {
			formErrors: ["User id and store id cannot be the same"],
			fieldErrors: {
				userId: ["String must contain at least 36 character(s)", "Invalid uuid"],
				storeId: ["String must contain at least 36 character(s)", "Invalid uuid"],
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

// Flattened shape tests.

const flac = createSafeActionClient({
	defaultValidationErrorsShape: "flattened",
});

test("typeschema - action with invalid input gives back an object with correct `validationErrors` (set flattened shape)", async () => {
	const schema = z.object({
		userId: z.string().min(36).uuid(),
		storeId: z.string().min(36).uuid(),
		store: z.object({
			product: z.object({
				id: z.string().uuid(),
			}),
		}),
	});

	const action = flac.schema(schema).action(async () => {
		return {
			ok: true,
		};
	});

	const actualResult = await action({
		userId: "invalid_uuid",
		storeId: "invalid_uuid",
		store: {
			product: {
				id: "invalid_uuid",
			},
		},
	});

	// Flattened shape discards errors for nested properties.
	const expectedResult = {
		validationErrors: {
			formErrors: [],
			fieldErrors: {
				userId: ["String must contain at least 36 character(s)", "Invalid uuid"],
				storeId: ["String must contain at least 36 character(s)", "Invalid uuid"],
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with root level schema error gives back an object with correct `validationErrors` (set flattened shape)", async () => {
	const schema = z
		.object({
			userId: z.string().min(36).uuid(),
			storeId: z.string().min(36).uuid(),
			store: z.object({
				product: z.object({
					id: z.string().uuid(),
				}),
			}),
		})
		.refine((d) => d.userId !== d.storeId, {
			message: "User and store IDs must be different",
		})
		.refine((d) => d.userId !== d.storeId, {
			message: "Another cool global error",
		});

	const action = flac.schema(schema).action(async () => {
		return {
			ok: true,
		};
	});

	const actualResult = await action({
		userId: "invalid_uuid",
		storeId: "invalid_uuid",
		store: {
			product: {
				id: "invalid_uuid",
			},
		},
	});

	// Flattened shape discards errors for nested properties.
	const expectedResult = {
		validationErrors: {
			formErrors: ["User and store IDs must be different", "Another cool global error"],
			fieldErrors: {
				userId: ["String must contain at least 36 character(s)", "Invalid uuid"],
				storeId: ["String must contain at least 36 character(s)", "Invalid uuid"],
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with invalid input gives back an object with correct `validationErrors` (set flattened shape overridden by custom formatted shape)", async () => {
	const schema = z
		.object({
			userId: z.string().min(36).uuid(),
			storeId: z.string().min(36).uuid(),
		})
		.refine((d) => d.userId !== d.storeId, {
			message: "User id and store id cannot be the same",
		});

	const action = flac
		.schema(schema, {
			handleValidationErrorsShape: formatValidationErrors,
		})
		.action(async () => {
			return {
				ok: true,
			};
		});

	const actualResult = await action({
		userId: "invalid_uuid",
		storeId: "invalid_uuid",
	});

	const expectedResult = {
		validationErrors: {
			_errors: ["User id and store id cannot be the same"],
			userId: {
				_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
			},
			storeId: {
				_errors: ["String must contain at least 36 character(s)", "Invalid uuid"],
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

// `returnValidationErrors` tests.

test("typeschema - action with errors set via `returnValidationErrors` gives back an object with correct `validationErrors` (default formatted shape)", async () => {
	const schema = z.object({
		username: z.string(),
		password: z.string(),
	});

	const errorsObject = {
		_errors: ["incorrect_credentials", "another_error"],
		username: {
			_errors: ["user_suspended"],
		},
		password: {
			_errors: ["invalid_password"],
		},
	};

	const action = dac.schema(schema).action(async ({ parsedInput }) => {
		if (parsedInput.username !== "johndoe" && parsedInput.password !== "password") {
			returnValidationErrors(schema, structuredClone(errorsObject));
		}

		return {
			ok: true,
		};
	});

	const actualResult = await action({
		username: "123",
		password: "456",
	});

	const expectedResult = {
		validationErrors: structuredClone(errorsObject),
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with errors set via `returnValidationErrors` gives back an object with correct `validationErrors` (set formatted shape)", async () => {
	const schema = z.object({
		username: z.string(),
		password: z.string(),
	});

	const errorsObject = {
		_errors: ["incorrect_credentials", "another_error"],
		username: {
			_errors: ["user_suspended"],
		},
		password: {
			_errors: ["invalid_password"],
		},
	};

	const action = foac.schema(schema).action(async ({ parsedInput }) => {
		if (parsedInput.username !== "johndoe" && parsedInput.password !== "password") {
			returnValidationErrors(schema, structuredClone(errorsObject));
		}

		return {
			ok: true,
		};
	});

	const actualResult = await action({
		username: "123",
		password: "456",
	});

	const expectedResult = {
		validationErrors: structuredClone(errorsObject),
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});

test("typeschema - action with errors set via `returnValidationErrors` gives back an object with correct `validationErrors` (set flattened shape)", async () => {
	const schema = z.object({
		username: z.string(),
		password: z.string(),
	});

	const action = flac.schema(schema).action(async ({ parsedInput }) => {
		if (parsedInput.username !== "johndoe" && parsedInput.password !== "password") {
			returnValidationErrors(schema, {
				_errors: ["incorrect_credentials", "another_error"],
				username: {
					_errors: ["user_suspended"],
				},
				password: {
					_errors: ["invalid_password"],
				},
			});
		}

		return {
			ok: true,
		};
	});

	const actualResult = await action({
		username: "123",
		password: "456",
	});

	const expectedResult = {
		validationErrors: {
			formErrors: ["incorrect_credentials", "another_error"],
			fieldErrors: {
				username: ["user_suspended"],
				password: ["invalid_password"],
			},
		},
	};

	assert.deepStrictEqual(actualResult, expectedResult);
});
