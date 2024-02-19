export const sanitizeData = <T, K extends keyof T>(data: T, ...propertiesToDelete: K[]): Omit<T, K> => {
  const sanitizedData = { ...data }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  propertiesToDelete.forEach(property => delete sanitizedData[property])
  return sanitizedData
}
