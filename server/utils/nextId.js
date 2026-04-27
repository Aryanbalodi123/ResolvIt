export async function getNextNumericId(model, field) {
  const last = await model.findOne({}, { [field]: 1, _id: 0 }).sort({ [field]: -1 }).lean();
  if (!last || typeof last[field] !== "number") {
    return 1;
  }
  return last[field] + 1;
}
