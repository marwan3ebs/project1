export function validatePropertyForm(form) {
  const errors = {};

  if (!String(form.customerName || '').trim()) {
    errors.customerName = 'Customer name is required.';
  }

  if (!String(form.customerPhone || '').trim()) {
    errors.customerPhone = 'Customer phone is required.';
  }

  if (!String(form.location || '').trim()) {
    errors.location = 'Location is required.';
  }

  if (!Number(form.price || 0)) {
    errors.price = 'Price or rent value is required.';
  }

  if (!Number(form.area || 0)) {
    errors.area = 'Area is required.';
  }

  if (!form.agentId) {
    errors.agentId = 'Agent is required.';
  }

  if (!form.agreementStartDate) {
    errors.agreementStartDate = 'Agreement start date is required.';
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors || {}).length > 0;
}
