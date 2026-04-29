import { describe, it, expect } from 'vitest';
import { compress } from './index.js';

describe('compress — Rule 4: filler removal', () => {
  it('removes "please" at start of sentence', () => {
    const input = 'Please validate the input before sending.';
    expect(compress(input)).toMatchSnapshot();
  });

  it('removes "make sure to"', () => {
    const input = 'Make sure to handle errors gracefully.';
    expect(compress(input)).toMatchSnapshot();
  });

  it('removes "note that"', () => {
    const input = 'Note that this endpoint requires authentication.';
    expect(compress(input)).toMatchSnapshot();
  });

  it('removes multiple fillers in one line', () => {
    const input = 'Please make sure to remember to validate the form.';
    expect(compress(input)).toMatchSnapshot();
  });
});

describe('compress — Rule 3: CRUD shorthand', () => {
  it('replaces "get all users" with GET /users', () => {
    const input = 'get all users from the database';
    expect(compress(input)).toMatchSnapshot();
  });

  it('replaces "create a new user"', () => {
    const input = 'create a new user in the system';
    expect(compress(input)).toMatchSnapshot();
  });
});

describe('compress — Rule 5: deduplication', () => {
  it('removes duplicate constraint lines', () => {
    const input = `## Section A
- Validate input
- Return 200 on success

## Section B
- Validate input
- Return 404 if not found`;
    expect(compress(input)).toMatchSnapshot();
  });
});

describe('compress — code block preservation', () => {
  it('does not modify fenced code block content', () => {
    const input = `\`\`\`typescript
// userName // user name
const userName = "test"; // userName
\`\`\``;
    const result = compress(input);
    expect(result).toMatchSnapshot();
    expect(result).toContain('// userName // user name');
  });
});

describe('compress — combined rules', () => {
  it('applies all rules to a realistic spec excerpt', () => {
    const input = `## Overview

Please note that you should make sure to implement the following.

Note that the system should get all users and return them.

- Validate input
- Handle errors

## Details

- Validate input

Please be sure to handle edge cases.

\`\`\`typescript
const userId: string = req.params.id; // userId
\`\`\``;
    expect(compress(input)).toMatchSnapshot();
  });

  it('is deterministic — same input produces same output', () => {
    const input = 'Please make sure to get all users from the system.';
    const r1 = compress(input);
    const r2 = compress(input);
    const r3 = compress(input);
    expect(r1).toBe(r2);
    expect(r2).toBe(r3);
  });
});
