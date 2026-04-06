import { httpError, parseDateOnly, parseNumber } from './_utils.js';

export const roles = ['Viewer', 'Analyst', 'Admin'];
export const statuses = ['active', 'inactive'];

export function validateCreateRecord(body) {
  const amount = parseNumber(body.amount);
  const type = body.type;
  const category = (body.category || '').trim();
  const date = parseDateOnly(body.date);
  const notes = body.notes === undefined || body.notes === null ? null : String(body.notes);

  const errors = {};
  if (amount === null) errors.amount = 'amount must be a number';
  if (!['income', 'expense'].includes(type)) errors.type = 'type must be income or expense';
  if (!category) errors.category = 'category is required';
  if (!date) errors.date = 'date must be YYYY-MM-DD';
  if (notes !== null && notes.length > 1000) errors.notes = 'notes too long';

  if (Object.keys(errors).length) throw httpError(400, 'Validation error', errors);
  return { amount, type, category, date, notes };
}

export function validateUpdateRecord(body) {
  const patch = {};
  const errors = {};

  if (body.amount !== undefined) {
    const amount = parseNumber(body.amount);
    if (amount === null) errors.amount = 'amount must be a number';
    else patch.amount = amount;
  }

  if (body.type !== undefined) {
    if (!['income', 'expense'].includes(body.type)) errors.type = 'type must be income or expense';
    else patch.type = body.type;
  }

  if (body.category !== undefined) {
    const category = (body.category || '').trim();
    if (!category) errors.category = 'category is required';
    else patch.category = category;
  }

  if (body.date !== undefined) {
    const date = parseDateOnly(body.date);
    if (!date) errors.date = 'date must be YYYY-MM-DD';
    else patch.date = date;
  }

  if (body.notes !== undefined) {
    const notes = body.notes === null ? null : String(body.notes);
    if (notes !== null && notes.length > 1000) errors.notes = 'notes too long';
    else patch.notes = notes;
  }

  if (Object.keys(errors).length) throw httpError(400, 'Validation error', errors);
  if (!Object.keys(patch).length) throw httpError(400, 'No fields to update');
  return patch;
}

export function validateUserUpdate(body) {
  const patch = {};
  const errors = {};

  if (body.role !== undefined) {
    if (!roles.includes(body.role)) errors.role = 'role must be Viewer, Analyst, or Admin';
    else patch.role = body.role;
  }

  if (body.status !== undefined) {
    if (!statuses.includes(body.status)) errors.status = 'status must be active or inactive';
    else patch.status = body.status;
  }

  if (Object.keys(errors).length) throw httpError(400, 'Validation error', errors);
  if (!Object.keys(patch).length) throw httpError(400, 'No fields to update');
  return patch;
}
